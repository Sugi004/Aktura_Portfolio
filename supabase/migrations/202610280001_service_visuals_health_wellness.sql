-- Add Health & Wellness Coordination to public service content and inquiry categories.
alter table public.services drop constraint if exists services_category_check;
alter table public.services add constraint services_category_check
  check (category in ('executive-support','travel','business-operations','digital-workflows','health-wellness','other'));
alter table public.inquiries drop constraint if exists inquiries_service_category_check;
alter table public.inquiries add constraint inquiries_service_category_check
  check (service_category in ('executive-support','travel','business-operations','digital-workflows','health-wellness','other'));

insert into public.services (slug,name,category,description,deliverables,client_benefit,active,sort_order) values
('marketing','Social media & digital marketing support','digital-workflows','Behind-the-scenes support for a consistent, organized marketing rhythm.','["Social media marketing support and campaign coordination","Short-form video editing and content repurposing","AI-assisted video generation with human review before publishing","Voice-over scripting and production coordination","Content planning, calendars, captions and approved publishing","Asset organization, routine engagement coordination and activity reports"]','Maintain a steady presence without losing sight of the work behind it.',true,11),
('health-wellness','Health & Wellness Coordination','health-wellness','Quiet, detail-minded coordination for routine wellness visits, appointment logistics and the reminders around them.','["Scheduling and reminders for appointments you request","Telehealth booking coordination and follow-up reminders","Dental, vision and wellness appointment coordination","Prescription refill reminders and pharmacy coordination","Organization of insurance correspondence and non-sensitive records","Calendar reminders for routine check-ins and paperwork"]','Keep everyday health and wellness logistics organized. This is administrative coordination only, not medical advice, diagnosis or treatment.',true,15)
on conflict (slug) do update set
  name = excluded.name, category = excluded.category, description = excluded.description,
  deliverables = excluded.deliverables, client_benefit = excluded.client_benefit,
  active = excluded.active, sort_order = excluded.sort_order, updated_at = now();

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
  if p_service_category not in ('executive-support','travel','business-operations','digital-workflows','health-wellness','other') then raise exception 'invalid category'; end if;
  if length(trim(p_message)) < 10 or length(p_message) > 5000 then raise exception 'invalid message'; end if;

  clean_service_selections := (
    select coalesce(jsonb_agg(to_jsonb(selected.slug) order by selected.position), '[]'::jsonb)
    from (
      select item as slug, min(ordinality) as position
      from jsonb_array_elements_text(case when jsonb_typeof(p_service_selections) = 'array' then p_service_selections else '[]'::jsonb end) with ordinality as services(item, ordinality)
      where item = any(array['executive','flights','accommodation','travel','ground','personal','reservations','visa','lead-gen','customer-support','operations','marketing','automation','research','expenses','health-wellness'])
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
