-- Explicit service-only policy in the unexposed rate-limit schema.
create policy "Service role manages analytics limiter"
on analytics_private.rate_limits for all to service_role
using (true) with check (true);
