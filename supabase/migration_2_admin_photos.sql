-- ============================================================
-- SARA Gallery — Migration 2: Admin-uploaded Photos
-- شغّل الكود ده في: Supabase Dashboard → SQL Editor → New query
-- (ده إضافة على الـ schema.sql الأساسي، مش بديل عنه)
-- ============================================================

-- ------------------------------------------------------------
-- 1) جدول الصور (بديل عن photos.json الثابت)
-- ------------------------------------------------------------
create table if not exists public.photos (
  id text primary key,                 -- slug فريد، نفس فكرة الـ id في photos.json
  src text not null,                   -- رابط الصورة في Supabase Storage
  category text not null check (category in ('sea', 'streets', 'architecture')),
  title text not null,
  caption text not null default '',
  width int not null,
  height int not null,
  aspect numeric not null,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists photos_category_idx on public.photos (category);
create index if not exists photos_created_at_idx on public.photos (created_at desc);

alter table public.photos enable row level security;

-- أي حد (حتى زائر مش مسجل) يقدر يشوف الصور
create policy "photos_select_all" on public.photos
  for select using (true);

-- بس الإيميلات المسموح لها (Admin) تقدر تضيف صورة
create policy "photos_insert_admin_only" on public.photos
  for insert
  with check (
    auth.jwt() ->> 'email' in ('kakroot1902@gmail.com', 'sararezk31@gmail.com')
  );

-- بس الإيميلات المسموح لها تقدر تمسح صورة
create policy "photos_delete_admin_only" on public.photos
  for delete
  using (
    auth.jwt() ->> 'email' in ('kakroot1902@gmail.com', 'sararezk31@gmail.com')
  );

-- بس الإيميلات المسموح لها تقدر تعدّل صورة (لو حبينا مستقبلاً)
create policy "photos_update_admin_only" on public.photos
  for update
  using (
    auth.jwt() ->> 'email' in ('kakroot1902@gmail.com', 'sararezk31@gmail.com')
  );

-- ------------------------------------------------------------
-- 2) Storage bucket لرفع الصور
-- ------------------------------------------------------------
-- لازم تعمل الخطوة دي يدوي من الـ Dashboard (الكود مش بيعمل bucket تلقائي بشكل موثوق من SQL Editor):
--   1. روح Storage (من القائمة الجانبية)
--   2. اضغط "New bucket"
--   3. اسم الـ bucket: gallery-photos
--   4. فعّل "Public bucket" (عشان الصور تتعرض في الموقع بدون توكن)
--   5. اضغط Create bucket

-- بعد ما تعمل الـ bucket يدوي، شغّل الـ policies دي عشان تتحكم في مين يرفع:

-- أي حد يقدر "يقرأ" الصور (يعني يشوفها في المتصفح)
create policy "gallery_photos_public_read"
on storage.objects for select
using (bucket_id = 'gallery-photos');

-- بس الإيميلات المسموح لها تقدر "ترفع" صور جديدة
create policy "gallery_photos_admin_insert"
on storage.objects for insert
with check (
  bucket_id = 'gallery-photos'
  and auth.jwt() ->> 'email' in ('kakroot1902@gmail.com', 'sararezk31@gmail.com')
);

-- بس الإيميلات المسموح لها تقدر تمسح صور
create policy "gallery_photos_admin_delete"
on storage.objects for delete
using (
  bucket_id = 'gallery-photos'
  and auth.jwt() ->> 'email' in ('kakroot1902@gmail.com', 'sararezk31@gmail.com')
);
