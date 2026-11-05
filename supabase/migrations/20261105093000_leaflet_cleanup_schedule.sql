-- Executa a limpeza diariamente às 09:00 UTC (06:00 de Brasília).
-- A URL e o token são usados exclusivamente para a função de limpeza.
-- O token permanece no Vault e não é gravado na definição do job.
select cron.schedule(
  'leaflet-storage-retention',
  '0 9 * * *',
  $job$
    select net.http_post(
      url := 'https://pmcvhrkykezvtdzkkfpa.supabase.co/functions/v1/leaflet-storage-cleanup',
      headers := jsonb_build_object(
        'Content-Type','application/json',
        'x-leaflet-cleanup-token',
        (select decrypted_secret from vault.decrypted_secrets
         where name='leaflet_cleanup_cron_token'
         order by created_at desc limit 1)
      ),
      body := '{"mode":"delete"}'::jsonb,
      timeout_milliseconds := 60000
    );
  $job$
);
