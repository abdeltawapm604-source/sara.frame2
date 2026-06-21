// الإيميلات المسموح لها برفع/مسح صور في الجاليري.
// ملحوظة أمان: القايمة دي بتتحكم في إظهار/إخفاء واجهة الرفع بس (UX).
// الحماية الحقيقية موجودة في Supabase RLS policies (supabase/migration_2_admin_photos.sql)
// عشان حتى لو حد عدّل الكود من المتصفح، السيرفر برضه هيرفض أي insert من غير الإيميلات دي.
export const ADMIN_EMAILS = [
  "kakroot1902@gmail.com",
  "sararezk31@gmail.com",
] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase() as (typeof ADMIN_EMAILS)[number]);
}
