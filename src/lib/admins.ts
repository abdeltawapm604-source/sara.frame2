// قايمة الإيميلات المسموح لها برفع صور جديدة للجاليري.
// ⚠️ ده تحقق على مستوى الواجهة بس (UX) — الحماية الحقيقية موجودة
// في RLS policies جوه Supabase (supabase/schema.sql)، لإن أي تحقق
// في الـ frontend وحده يقدر أي حد يتجاوزه بسهولة.
export const ADMIN_EMAILS = [
  "kakroot1902@gmail.com",
  "sararezk31@gmail.com",
] as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase() as (typeof ADMIN_EMAILS)[number]);
}
