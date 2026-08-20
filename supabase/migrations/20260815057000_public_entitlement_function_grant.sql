-- active_landing_pages invokes this security-definer helper. Explicit execute
-- grants are required for PostgREST/service_role as well as public reads.
revoke all on function private.has_shop_publish_entitlement(uuid) from public;
grant execute on function private.has_shop_publish_entitlement(uuid) to anon, authenticated, service_role;
