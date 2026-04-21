begin;

create unique index if not exists idx_characters_alias_unique
on public.characters (lower(btrim(alias)))
where alias is not null and btrim(alias) <> '';

commit;