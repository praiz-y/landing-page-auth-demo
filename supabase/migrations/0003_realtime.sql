-- Portfolio batch: enable Realtime for notes and goals so open tabs/devices
-- see each other's changes live. Applied manually via the Supabase SQL
-- Editor, same as 0001/0002.
--
-- Wrapped in existence checks because `alter publication ... add table`
-- errors if the table is already in the publication (e.g. re-running this
-- file, or if it was added by hand in the dashboard already).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notes'
  ) then
    alter publication supabase_realtime add table notes;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'goals'
  ) then
    alter publication supabase_realtime add table goals;
  end if;
end $$;
