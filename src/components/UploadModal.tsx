"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, UploadCloud, ImageOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUploaded: () => void;
}

type CategoryOption = "sea" | "streets" | "architecture";

const CATEGORY_LABELS: Record<CategoryOption, string> = {
  sea: "Sea",
  streets: "Streets",
  architecture: "Architecture",
};

export default function UploadModal({ isOpen, onClose, user, onUploaded }: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<CategoryOption>("sea");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setFile(null);
    setPreviewUrl(null);
    setDimensions(null);
    setTitle("");
    setCaption("");
    setCategory("sea");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleFileSelect = (selected: File | undefined) => {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setError("الملف لازم يكون صورة.");
      return;
    }
    setError(null);
    setFile(selected);

    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);

    const img = new window.Image();
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file || !dimensions) {
      setError("اختار صورة الأول.");
      return;
    }
    if (!title.trim() || !caption.trim()) {
      setError("العنوان والوصف مطلوبين.");
      return;
    }

    setLoading(true);

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery-uploads")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("gallery-uploads")
        .getPublicUrl(path);

      const { error: insertError } = await supabase.from("photos").insert({
        uploaded_by: user.id,
        src: publicUrlData.publicUrl,
        category,
        title: title.trim(),
        caption: caption.trim(),
        width: dimensions.width,
        height: dimensions.height,
        aspect: Number((dimensions.width / dimensions.height).toFixed(4)),
      });

      if (insertError) throw insertError;

      onUploaded();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حصل خطأ أثناء الرفع، حاول تاني.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="absolute inset-0 bg-[#362C28]/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            className="relative w-full max-w-md bg-white rounded-[10px] shadow-[0_20px_60px_rgba(54,44,40,0.25)] overflow-hidden my-auto"
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={handleClose}
              className="absolute top-3.5 right-3.5 z-10 text-[#362C28]/40 hover:text-[#362C28] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <div className="px-7 pt-9 pb-6 text-center border-b border-[#362C28]/10">
              <h2 className="font-serif text-xl text-[#362C28]">إضافة صورة جديدة</h2>
              <p className="font-sans text-xs text-[#362C28]/55 mt-1.5">
                الصورة هتتنشر فوراً في الأرشيف العام
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />
                {previewUrl ? (
                  <div
                    className="relative w-full rounded-[8px] overflow-hidden bg-[#FCFAF8] border border-[#362C28]/15 cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-64 object-contain" />
                    <div className="absolute inset-0 bg-[#362C28]/0 group-hover:bg-[#362C28]/40 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
                        تغيير الصورة
                      </span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 py-10 rounded-[8px] border-2 border-dashed border-[#362C28]/20 hover:border-[#8C6A53] bg-[#FCFAF8] transition-colors text-[#362C28]/50 hover:text-[#8C6A53]"
                  >
                    <UploadCloud className="w-7 h-7" strokeWidth={1.3} />
                    <span className="text-xs font-medium">دوس لاختيار صورة</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-[#362C28]/50">
                  Category
                </label>
                <div className="flex gap-2">
                  {(Object.keys(CATEGORY_LABELS) as CategoryOption[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`flex-1 py-2 text-[12.5px] rounded-[6px] border transition-colors ${
                        category === cat
                          ? "bg-[#362C28] border-[#362C28] text-white"
                          : "bg-[#FCFAF8] border-[#362C28]/15 text-[#362C28]/70 hover:border-[#8C6A53]"
                      }`}
                    >
                      {CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-[#362C28]/50">
                  Title
                </label>
                <input
                  type="text"
                  required
                  maxLength={80}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-[#FCFAF8] border border-[#362C28]/15 rounded-[6px] outline-none focus:border-[#8C6A53] transition-colors text-[#362C28]"
                  placeholder="عنوان الصورة"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-[10px] uppercase tracking-widest text-[#362C28]/50">
                  Caption
                </label>
                <input
                  type="text"
                  required
                  maxLength={140}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-[#FCFAF8] border border-[#362C28]/15 rounded-[6px] outline-none focus:border-[#8C6A53] transition-colors text-[#362C28]"
                  placeholder="وصف قصير / مكان الصورة"
                />
              </div>

              {error && (
                <p className="flex items-center gap-2 text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-[6px] px-3 py-2">
                  <ImageOff className="w-4 h-4 shrink-0" />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full flex items-center justify-center gap-2 bg-[#8C6A53] hover:bg-[#76573F] text-white text-sm font-medium py-2.5 rounded-[6px] transition-colors disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "بيترفع..." : "نشر الصورة"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
