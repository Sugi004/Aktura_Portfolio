-- The public endpoint uses the server-only service role. Anonymous clients cannot
-- call the submission RPC directly or write inquiry rows around application limits.
revoke all on function public.submit_public_inquiry(text,text,text,text,text,text,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.submit_public_inquiry(text,text,text,text,text,text,text,text,text,jsonb) to service_role;
revoke all on public.inquiries from anon, authenticated;
grant select, update on public.inquiries to authenticated;

create table if not exists public.inquiry_rate_limits (
  key_hash text primary key check (key_hash ~ '^[0-9a-f]{64}$'),
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  updated_at timestamptz not null default now()
);
alter table public.inquiry_rate_limits enable row level security;
revoke all on public.inquiry_rate_limits from public, anon, authenticated;

create or replace function public.claim_inquiry_rate_key(
  p_key_hash text,
  p_max_requests integer,
  p_window interval
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
begin
  insert into public.inquiry_rate_limits (key_hash, window_started_at, request_count, updated_at)
  values (p_key_hash, now(), 1, now())
  on conflict (key_hash) do update set
    request_count = case
      when public.inquiry_rate_limits.window_started_at <= now() - p_window then 1
      else public.inquiry_rate_limits.request_count + 1
    end,
    window_started_at = case
      when public.inquiry_rate_limits.window_started_at <= now() - p_window then now()
      else public.inquiry_rate_limits.window_started_at
    end,
    updated_at = now()
  returning request_count into current_count;

  return current_count <= p_max_requests;
end;
$$;

create or replace function public.check_inquiry_rate_limit(
  p_ip_key_hash text default null,
  p_email_key_hash text default null
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed boolean := true;
begin
  if p_ip_key_hash is null and p_email_key_hash is null then
    raise exception 'rate-limit key is required';
  end if;
  if p_ip_key_hash is not null then
    if p_ip_key_hash !~ '^[0-9a-f]{64}$' then raise exception 'invalid rate-limit key'; end if;
    allowed := public.claim_inquiry_rate_key(p_ip_key_hash, 5, interval '1 hour');
  end if;
  if p_email_key_hash is not null then
    if p_email_key_hash !~ '^[0-9a-f]{64}$' then raise exception 'invalid rate-limit key'; end if;
    allowed := public.claim_inquiry_rate_key(p_email_key_hash, 3, interval '1 day') and allowed;
  end if;

  -- Bound storage growth without retaining raw IP addresses or email addresses.
  delete from public.inquiry_rate_limits where updated_at < now() - interval '8 days';
  return allowed;
end;
$$;

revoke all on function public.claim_inquiry_rate_key(text,integer,interval) from public, anon, authenticated;
revoke all on function public.check_inquiry_rate_limit(text,text) from public, anon, authenticated;
grant execute on function public.check_inquiry_rate_limit(text,text) to service_role;
