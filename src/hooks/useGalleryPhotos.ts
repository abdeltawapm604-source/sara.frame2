"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Photo } from "@/components/MasonryGallery";

interface DbPhotoRow {
  id: string;
  src: string;
  category: "sea" | "streets" | "architecture";
  title: string;
  caption: string;
  width: number;
  height: number;
  aspect: number;
}

async function fetchUploadedPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("id, src, category, title, caption, width, height, aspect")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as DbPhotoRow[]).map((row) => ({ ...row, isUploaded: true })) as Photo[];
}

export function useGalleryPhotos(staticPhotos: Photo[]) {
  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchUploadedPhotos().then((data) => {
      if (!mounted) return;
      setUploadedPhotos(data);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    const data = await fetchUploadedPhotos();
    setUploadedPhotos(data);
  }, []);

  // الصور المرفوعة حديثاً تظهر الأول، وبعدها الأرشيف الأساسي
  const allPhotos = [...uploadedPhotos, ...staticPhotos];

  return { photos: allPhotos, loading, refresh };
}
