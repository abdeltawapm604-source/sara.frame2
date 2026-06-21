# SARA — Visual Archive

موقع معرض صور احترافي بستايل Instagram، مبني بـ Next.js + Tailwind CSS v4 + Framer Motion + Supabase
(Auth حقيقي + Likes/Comments/Saves محفوظين في قاعدة بيانات + رفع صور خاص بحسابين Admin فقط).

## 1) إعداد Supabase (لازم قبل التشغيل)

### أ. شغّل الجداول والـ Storage bucket
1. افتح [Supabase Dashboard](https://supabase.com/dashboard) → مشروعك → **SQL Editor**
2. افتح ملف `supabase/schema.sql` من المشروع ده، انسخ محتواه بالكامل، الصقه في SQL Editor، واضغط **Run**
3. ده هيعمل:
   - 4 جداول: `likes`, `saves`, `comments`, `photos` — مع Row Level Security مفعّل عليهم كلهم
   - Storage bucket اسمه `gallery-uploads` لرفع الصور (حد أقصى 10MB للصورة، JPEG/PNG/WebP/HEIC بس)

### ب. الإيميلات المسموح لها بالرفع (Admin)
الحسابين المسموح لهم برفع صور جديدة محددين في مكانين لازم يتطابقوا:
- `src/lib/admins.ts` (في الكود — بيتحكم في ظهور زرار "Add Photo")
- `supabase/schema.sql` (في الـ RLS policies — بيمنع أي حد تاني من الرفع حتى لو حاول يستخدم الـ API مباشرة)

الإيميلات الحالية:
```
kakroot1902@gmail.com
sararezk31@gmail.com
```

لو حبيت تغيّر/تضيف إيميل تالت، لازم تعدّل في **الملفين** مع بعض.

### ج. تأكد من إعدادات الـ Auth
في **Authentication → Providers**، تأكد إن **Email** provider مفعّل (مفعّل افتراضياً).

لو عايز تشغيل سريع بدون تأكيد إيميل وقت التجربة: **Authentication → Settings → Email Auth** → عطّل "Confirm email" مؤقتاً.

### د. الـ environment variables
موجودين في `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://bldagevevxqtsefvkacj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

⚠️ **لو هتنشر على Vercel:**
1. لازم تحط نفس القيمتين دول في **Vercel → مشروعك → Settings → Environment Variables**
2. فعّل الـ checkboxes التلاتة (Production / Preview / Development) لكل واحدة
3. بعد الإضافة، لازم تعمل **Redeploy** (مع إلغاء تفعيل "Use existing Build Cache") — Next.js بياخد قيم
   الـ `NEXT_PUBLIC_*` وقت الـ **build** مش وقت تشغيل الموقع، فأي إضافة للـ variables بعد آخر build
   مش هتتطبق لحد ما تعمل build جديد فعلي
4. تأكد إنك بتضيف الـ variables في **نفس المشروع** اللي الدومين بتاعك بيشاور عليه فعلياً
   (لو عندك أكتر من مشروع بنفس الاسم تقريباً في Vercel من محاولات استيراد سابقة، امسح الزيادة منهم
   عشان متلخبطش)

## 2) التشغيل محلياً

```bash
npm install
npm run dev
```

افتح http://localhost:3000

## 3) البناء للنشر

```bash
npm run build
npm start
```

## هيكل المشروع

- `src/components/BootIntro.tsx` — شاشة الـ Terminal/Boot وتأثير الستارة
- `src/components/Hero.tsx` — ظهور اسم SARA
- `src/components/Header.tsx` — الهيدر الزجاجي، الفلاتر، زرار Sign in/out، وزرار Add Photo (admin فقط)
- `src/components/ExpertiseSection.tsx` — كروت المهارات الثلاثة
- `src/components/MasonryGallery.tsx` — معرض الصور بستايل Instagram (Like/Comment/Save حقيقي عبر Supabase)
- `src/components/AuthModal.tsx` — مودال تسجيل الدخول / إنشاء حساب
- `src/components/UploadModal.tsx` — مودال رفع صورة جديدة (admin فقط)
- `src/hooks/useAuth.ts` — Hook لمتابعة حالة تسجيل الدخول
- `src/hooks/useGalleryPhotos.ts` — Hook بيدمج صور `photos.json` الثابتة مع الصور المرفوعة من Supabase
- `src/lib/supabase.ts` — Supabase client
- `src/lib/admins.ts` — قايمة إيميلات الـ Admin المسموح لهم بالرفع
- `src/data/photos.json` — أرشيف الصور الأساسي (الـ 24 صورة الأولى)
- `public/gallery/` — الصور المضغوطة الأساسية (WebP)
- `supabase/schema.sql` — كود إنشاء الجداول، الـ Storage bucket، والصلاحيات

## نظام الصلاحيات (مين يقدر يعمل إيه)

| الفعل | زائر (مش مسجل) | مستخدم مسجل عادي | Admin (إنت/سارة) |
|---|---|---|---|
| يشوف الصور والكومنتات | ✅ | ✅ | ✅ |
| يعمل Like / Comment / Save | ❌ (يفتحله مودال تسجيل دخول) | ✅ | ✅ |
| يضيف صورة جديدة للجاليري | ❌ | ❌ | ✅ |

الحماية مش بس في الواجهة — حتى لو حد حاول يضيف صورة عن طريق استدعاء الـ API مباشرة بدون المرور
بالواجهة، الـ RLS policies جوه Supabase هترفض الطلب لو إيميله مش من الاتنين المسموح لهم.

## تعديل الصور الأساسية أو التصنيفات

عدّل `src/data/photos.json` مباشرة، أو استخدم `process_images.py` لإعادة معالجة صور جديدة
(يحتاج Pillow: `pip install Pillow`). الصور دي منفصلة عن نظام الرفع بتاع الـ Admin.
