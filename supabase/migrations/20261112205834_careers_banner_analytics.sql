alter table public.site_analytics_events drop constraint site_analytics_events_path_check;
alter table public.site_analytics_events add constraint site_analytics_events_path_check check (length(path) <= 160 and path ~ '^/($|(quem-somos|lojas|folheteria|delivery|drogaria|revista|politicas|vagas)$|folheteria/[a-z0-9-]+$)');
