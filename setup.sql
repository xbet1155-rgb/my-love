-- حكايتنا: شغّل الملف ده مرة واحدة في Supabase ← SQL Editor ← Run
-- لو غيّرت إيميل الأدمن، غيّره هنا وفي config.js

create or replace function public.is_admin() returns boolean language sql stable as $$
  select coalesce(auth.jwt()->>'email','') = 'admin@hekayetna.app'
$$;

create table if not exists public.settings(key text primary key, value text not null default '');
create table if not exists public.items(
  id uuid primary key default gen_random_uuid(), kind text not null,
  title text not null default '', body text not null default '', url text not null default '', extra text not null default '',
  pos bigint not null default (extract(epoch from now())*1000)::bigint);
create table if not exists public.locked(id uuid primary key default gen_random_uuid(), title text not null, at timestamptz not null);
create table if not exists public.locked_text(id uuid primary key references public.locked(id) on delete cascade, body text not null default '');

alter table public.settings enable row level security;
alter table public.items enable row level security;
alter table public.locked enable row level security;
alter table public.locked_text enable row level security;

drop policy if exists "read" on public.settings;  drop policy if exists "words" on public.settings;  drop policy if exists "admin" on public.settings;
drop policy if exists "read" on public.items;     drop policy if exists "admin" on public.items;
drop policy if exists "read" on public.locked;    drop policy if exists "admin" on public.locked;
drop policy if exists "read" on public.locked_text; drop policy if exists "admin" on public.locked_text;

-- الزائر (بعد كلمة السر) يقرأ، والأدمن بس اللي يكتب
create policy "read" on public.settings for select to authenticated using (true);
create policy "words" on public.settings for select to anon using (key = 'words');
create policy "admin" on public.settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "read" on public.items for select to authenticated using (true);
create policy "admin" on public.items for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "read" on public.locked for select to authenticated using (true);
create policy "admin" on public.locked for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- نص الرسالة المقفولة مش بيتبعت للزائر إلا لما وقتها يجي (القفل من السيرفر فعلاً)
create policy "read" on public.locked_text for select to authenticated
  using (public.is_admin() or exists (select 1 from public.locked l where l.id = locked_text.id and l.at <= now()));
create policy "admin" on public.locked_text for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- مخزن الصور والفيديوهات والأغاني
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
drop policy if exists "media_insert" on storage.objects; drop policy if exists "media_delete" on storage.objects;
create policy "media_insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "media_delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- التحديث التلقائي المباشر
alter publication supabase_realtime add table public.settings, public.items, public.locked;
