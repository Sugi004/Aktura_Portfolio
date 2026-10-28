create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null check (category in ('executive-support','travel','business-operations','digital-workflows','other')),
  description text not null default '',
  deliverables jsonb not null default '[]'::jsonb,
  client_benefit text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  starting_price_cents integer not null check (starting_price_cents >= 0),
  billing_period text not null default 'month' check (billing_period = 'month'),
  audience text not null default '',
  scope jsonb not null default '[]'::jsonb,
  note text not null default '',
  is_draft boolean not null default true,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.demonstration_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null default '',
  services jsonb not null default '[]'::jsonb,
  is_demonstration boolean not null default true check (is_demonstration),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  email text not null,
  company text,
  service_category text not null check (service_category in ('executive-support','travel','business-operations','digital-workflows','other')),
  service_slug text,
  service_selections jsonb not null default '[]'::jsonb check (jsonb_typeof(service_selections) = 'array'),
  timezone text,
  budget text,
  contact_method text,
  message text not null,
  status text not null default 'new' check (status in ('new','reviewing','preparing-proposal','awaiting-approval','in-progress','completed','cancelled')),
  requirements text,
  quoted_amount_cents integer check (quoted_amount_cents is null or quoted_amount_cents >= 0),
  approval_due_at timestamptz,
  deadline_at timestamptz,
  supplier_name text,
  supplier_confirmation_reference text,
  supplier_confirmed_at timestamptz,
  internal_notes text,
  follow_up_at timestamptz,
  travel_details jsonb,
  check (supplier_confirmed_at is null or supplier_confirmation_reference is not null)
);

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_status_idx on public.inquiries (status);

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger services_touch_updated_at before update on public.services for each row execute function public.touch_updated_at();
create trigger packages_touch_updated_at before update on public.packages for each row execute function public.touch_updated_at();
create trigger faqs_touch_updated_at before update on public.faqs for each row execute function public.touch_updated_at();
create trigger demonstration_projects_touch_updated_at before update on public.demonstration_projects for each row execute function public.touch_updated_at();
create trigger inquiries_touch_updated_at before update on public.inquiries for each row execute function public.touch_updated_at();

alter table public.admin_users enable row level security;
alter table public.services enable row level security;
alter table public.packages enable row level security;
alter table public.faqs enable row level security;
alter table public.demonstration_projects enable row level security;
alter table public.inquiries enable row level security;

create policy "Admins can read admin roster" on public.admin_users for select to authenticated
  using (user_id = auth.uid());

create policy "Public reads active services" on public.services for select to anon, authenticated using (active);
create policy "Admins manage services" on public.services for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Public reads approved active packages" on public.packages for select to anon, authenticated using (active and not is_draft);
create policy "Admins manage packages" on public.packages for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Public reads active FAQs" on public.faqs for select to anon, authenticated using (active);
create policy "Admins manage FAQs" on public.faqs for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Public reads active demonstration projects" on public.demonstration_projects for select to anon, authenticated using (active);
create policy "Admins manage demonstration projects" on public.demonstration_projects for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admins manage inquiries" on public.inquiries for all to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Public inquiry requests are submitted by the server-only service-role client.
-- End users cannot call this function or read/write inquiry records directly.
create or replace function public.submit_public_inquiry(
  p_name text,
  p_email text,
  p_company text,
  p_service_category text,
  p_service_slug text,
  p_timezone text,
  p_budget text,
  p_contact_method text,
  p_message text,
  p_travel_details jsonb default null,
  p_service_selections jsonb default '[]'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
  clean_travel jsonb;
  clean_service_selections jsonb;
  travel_key text;
  allowed_travel_keys text[];
  travel_value jsonb;
begin
  if length(trim(p_name)) < 2 or length(p_name) > 120 then raise exception 'invalid name'; end if;
  if length(p_email) > 254 or p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'invalid email'; end if;
  if p_service_category not in ('executive-support','travel','business-operations','digital-workflows','other') then raise exception 'invalid category'; end if;
  if length(trim(p_message)) < 10 or length(p_message) > 5000 then raise exception 'invalid message'; end if;

  clean_service_selections := (
    select coalesce(jsonb_agg(to_jsonb(selected.slug) order by selected.position), '[]'::jsonb)
    from (
      select item as slug, min(ordinality) as position
      from jsonb_array_elements_text(case when jsonb_typeof(p_service_selections) = 'array' then p_service_selections else '[]'::jsonb end) with ordinality as services(item, ordinality)
      where item = any(array['executive','flights','accommodation','travel','ground','personal','reservations','visa','lead-gen','customer-support','operations','marketing','automation','research','expenses'])
      group by item
      order by min(ordinality)
      limit 15
    ) selected
  );

  if jsonb_typeof(p_travel_details) = 'object' then
    if p_travel_details->>'tripType' in ('flight','hotel','complete-trip','reservation') then
      clean_travel := jsonb_build_object('tripType', p_travel_details->>'tripType');
      allowed_travel_keys := case p_travel_details->>'tripType'
        when 'flight' then array['origin','destination','departureDate','returnDate','tripMode','passengers','travelers','cabin','preferences','requirements']
        when 'hotel' then array['destination','accommodationType','checkIn','checkOut','guests','rooms','travelers','accommodation','preferences','requirements']
        when 'complete-trip' then array['origin','destination','destinations','departureDate','returnDate','components','preferences','requirements']
        else array['location','destination','occasion','date','departureDate','time','partySize','preference','preferences','requirements']
      end;
      foreach travel_key in array allowed_travel_keys loop
        travel_value := p_travel_details->travel_key;
        if jsonb_typeof(travel_value) = 'string' then
          if travel_key in ('departureDate','returnDate','checkIn','checkOut','date') then
            if travel_value #>> '{}' ~ '^\d{4}-\d{2}-\d{2}$' then clean_travel := clean_travel || jsonb_build_object(travel_key, travel_value #>> '{}'); end if;
          else
            clean_travel := clean_travel || jsonb_build_object(travel_key, left(travel_value #>> '{}', case when travel_key = 'requirements' then 1200 else 300 end));
          end if;
        elsif travel_key in ('passengers','guests','rooms','travelers','partySize')
          and ((travel_key = 'partySize' and travel_value #>> '{}' ~ '^([1-9]|[1-9][0-9]|100)$')
            or (travel_key <> 'partySize' and travel_value #>> '{}' ~ '^([1-9]|1[0-9]|20)$')) then
          clean_travel := clean_travel || jsonb_build_object(travel_key, (travel_value #>> '{}')::integer);
        elsif travel_key in ('components','destinations') and jsonb_typeof(travel_value) = 'array' then
          clean_travel := clean_travel || jsonb_build_object(travel_key, (
            select coalesce(jsonb_agg(to_jsonb(left(item,160))), '[]'::jsonb)
            from (select value as item from jsonb_array_elements_text(travel_value) limit 12) items
          ));
        end if;
      end loop;
    end if;
  end if;

  insert into public.inquiries (name,email,company,service_category,service_slug,service_selections,timezone,budget,contact_method,message,travel_details)
  values (trim(p_name), lower(trim(p_email)), nullif(left(trim(coalesce(p_company,'')),160),''), p_service_category, nullif(left(trim(coalesce(p_service_slug,'')),120),''), clean_service_selections, nullif(left(trim(coalesce(p_timezone,'')),80),''), nullif(left(trim(coalesce(p_budget,'')),120),''), nullif(left(trim(coalesce(p_contact_method,'')),40),''), trim(p_message), clean_travel)
  returning id into new_id;
  return new_id;
end;
$$;

revoke all on function public.submit_public_inquiry(text,text,text,text,text,text,text,text,text,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.submit_public_inquiry(text,text,text,text,text,text,text,text,text,jsonb,jsonb) to service_role;
revoke all on public.inquiries from anon, authenticated;
grant select on public.admin_users to authenticated;
grant select on public.services, public.packages, public.faqs, public.demonstration_projects to anon, authenticated;
grant insert, update, delete on public.services, public.packages, public.faqs, public.demonstration_projects to authenticated;
grant select, update on public.inquiries to authenticated;

-- Seed package scope as editable draft content. Review before making packages public.
insert into public.packages (name, starting_price_cents, audience, scope, note, is_draft, sort_order)
values
  ('Essential Remote Assistance',15000,'For a focused, recurring set of administrative tasks.','["Up to 5 hours of agreed support each month","Email and calendar support","Task organization and routine follow-ups","Basic research and a monthly summary"]'::jsonb,'Final scope and availability are agreed before work begins.',true,0),
  ('Executive & travel support',35000,'For a busy schedule with regular travel or coordination needs.','["Up to 12 hours of agreed support each month","Executive assistance plus one travel or personal area","Priority scheduling for planned travel requests","Weekly progress update and itinerary organization"]'::jsonb,'Third-party bookings and travel charges are separate.',true,1),
  ('Premium Remote Business Partner',70000,'For broader ongoing support across operations and executive work.','["Up to 25 hours of agreed support each month","A coordinated mix of agreed service areas","Lead management or customer follow-ups","Weekly planning and monthly activity review"]'::jsonb,'Capacity, response windows and inclusions are confirmed in a proposal.',true,2)
on conflict do nothing;

-- Add the authorized admin UUID after creating its Supabase Auth account:
-- insert into public.admin_users (user_id) values ('<auth.users.id>');
