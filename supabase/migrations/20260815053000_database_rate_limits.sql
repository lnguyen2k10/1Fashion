-- Distributed, dependency-free rate limiting for public write APIs.
-- The client identifier is SHA-256 hashed by the application before it reaches
-- this table, so the database does not retain raw IP addresses.
create table if not exists private.api_rate_limits (
  namespace text not null,
  identifier_hash text not null,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check (request_count >= 0),
  primary key (namespace, identifier_hash)
);

create index if not exists idx_api_rate_limits_window
  on private.api_rate_limits(window_started_at);

create or replace function public.consume_api_rate_limit(
  input_namespace text,
  input_identifier_hash text,
  input_limit integer,
  input_window_seconds integer
)
returns table (allowed boolean, retry_after_seconds integer)
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  current_count integer;
  current_window timestamptz;
begin
  if input_namespace !~ '^[a-z_]{1,40}$'
    or length(input_identifier_hash) <> 64
    or input_limit < 1 or input_limit > 10000
    or input_window_seconds < 1 or input_window_seconds > 86400 then
    raise exception 'invalid_rate_limit_input';
  end if;

  insert into private.api_rate_limits as rate_limit (
    namespace, identifier_hash, window_started_at, request_count
  ) values (input_namespace, input_identifier_hash, now(), 1)
  on conflict (namespace, identifier_hash) do update
  set window_started_at = case
        when rate_limit.window_started_at + make_interval(secs => input_window_seconds) <= now()
          then now()
        else rate_limit.window_started_at
      end,
      request_count = case
        when rate_limit.window_started_at + make_interval(secs => input_window_seconds) <= now()
          then 1
        else rate_limit.request_count + 1
      end
  returning request_count, window_started_at into current_count, current_window;

  if random() < 0.01 then
    delete from private.api_rate_limits
    where window_started_at < now() - interval '2 days';
  end if;

  return query select
    current_count <= input_limit,
    greatest(1, ceil(extract(epoch from (current_window + make_interval(secs => input_window_seconds) - now())))::integer);
end;
$$;

revoke all on table private.api_rate_limits from public, anon, authenticated;
revoke all on function public.consume_api_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_api_rate_limit(text, text, integer, integer) to service_role;
