-- ============================================================
-- SARA Gallery — Supabase schema
-- شغّل الكود ده كامل في: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- جدول اللايكات
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  photo_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, photo_id)
);

-- جدول الصور المحفوظة (Save / Bookmark)
create table if not exists public.saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  photo_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, photo_id)
);

-- جدول التعليقات
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  photo_id text not null,
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

-- فهارس لتسريع القراءة حسب الصورة
create index if not exists likes_photo_id_idx on public.likes (photo_id);
create index if not exists saves_photo_id_idx on public.saves (photo_id);
create index if not exists comments_photo_id_idx on public.comments (photo_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.likes enable row level security;
alter table public.saves enable row level security;
alter table public.comments enable row level security;

-- اللايكات: أي حد يقدر يقرأ (عشان نعرض العدد)، بس بس صاحب الحساب يقدر يضيف/يمسح بتاعه هو
create policy "likes_select_all" on public.likes
  for select using (true);

create policy "likes_insert_own" on public.likes
  for insert with check (auth.uid() = user_id);

create policy "likes_delete_own" on public.likes
  for delete using (auth.uid() = user_id);

-- المحفوظات: كل مستخدم يشوف ويتحكم في بتاعته بس (خاصة)
create policy "saves_select_own" on public.saves
  for select using (auth.uid() = user_id);

create policy "saves_insert_own" on public.saves
  for insert with check (auth.uid() = user_id);

create policy "saves_delete_own" on public.saves
  for delete using (auth.uid() = user_id);

-- التعليقات: أي حد يقدر يقرأ، بس بس صاحب الحساب يضيف باسمه
create policy "comments_select_all" on public.comments
  for select using (true);

create policy "comments_insert_own" on public.comments
  for insert with check (auth.uid() = user_id);

create policy "comments_delete_own" on public.comments
  for delete using (auth.uid() = user_id);

-- ============================================================
-- جدول الصور (Admin-only upload)
-- ============================================================
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  src text not null,
  category text not null check (category in ('sea', 'streets', 'architecture')),
  title text not null,
  caption text not null,
  width integer not null,
  height integer not null,
  aspect numeric not null,
  created_at timestamptz not null default now()
);

create index if not exists photos_category_idx on public.photos (category);
create index if not exists photos_created_at_idx on public.photos (created_at desc);

alter table public.photos enable row level security;

-- أي حد يقدر يقرأ الصور (الجاليري عامة)
create policy "photos_select_all" on public.photos
  for select using (true);

-- بس الإيميلين المحددين (الـ admins) يقدروا يضيفوا صور
-- ملحوظة: لازم تحدّث الإيميلات دي لو غيّرتهم في الكود (src/lib/admins.ts) كمان
create policy "photos_insert_admin_only" on public.photos
  for insert with check (
    auth.jwt() ->> 'email' in (
      'kakroot1902@gmail.com',
      'sararezk31@gmail.com'
    )
  );

create policy "photos_delete_admin_only" on public.photos
  for delete using (
    auth.jwt() ->> 'email' in (
      'kakroot1902@gmail.com',
      'sararezk31@gmail.com'
    )
  );

-- ============================================================
-- Storage bucket للصور المرفوعة
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery-uploads',
  'gallery-uploads',
  true,
  10485760, -- 10MB حد أقصى لكل صورة
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- أي حد يقدر يشوف الصور (bucket عام عشان تتعرض في الموقع)
create policy "gallery_uploads_select_all" on storage.objects
  for select using (bucket_id = 'gallery-uploads');

-- بس الـ admins يقدروا يرفعوا
create policy "gallery_uploads_insert_admin_only" on storage.objects
  for insert with check (
    bucket_id = 'gallery-uploads'
    and auth.jwt() ->> 'email' in (
      'kakroot1902@gmail.com',
      'sararezk31@gmail.com'
    )
  );

create policy "gallery_uploads_delete_admin_only" on storage.objects
  for delete using (
    bucket_id = 'gallery-uploads'
    and auth.jwt() ->> 'email' in (
      'kakroot1902@gmail.com',
      'sararezk31@gmail.com'
    )
  );
