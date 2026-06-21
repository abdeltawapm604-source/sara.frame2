"use client";

import { useState } from "react";
import BootIntro from "@/components/BootIntro";
import Hero from "@/components/Hero";
import Header, { type Category } from "@/components/Header";
import MasonryGallery, { type Photo } from "@/components/MasonryGallery";
import UploadModal from "@/components/UploadModal";
import AuthModal from "@/components/AuthModal";
import photosData from "@/data/photos.json";
import { useAuth } from "@/hooks/useAuth";
import { useGalleryPhotos } from "@/hooks/useGalleryPhotos";
import { isAdminEmail } from "@/lib/admins";

const staticPhotos = photosData as Photo[];

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [filter, setFilter] = useState<Category>("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const { user } = useAuth();
  const { photos, refresh } = useGalleryPhotos(staticPhotos);

  const isAdmin = isAdminEmail(user?.email);

  return (
    <main className="grain relative min-h-screen bg-ink">
      <BootIntro onComplete={() => setBooted(true)} />

      <Header
        active={filter}
        onChange={setFilter}
        visible={booted}
        showAddPhoto={isAdmin}
        onAddPhoto={() => setIsUploadOpen(true)}
        user={user}
        onSignIn={() => setIsAuthOpen(true)}
      />
      <Hero ready={booted} />

      <div className="mx-auto max-w-6xl px-5 sm:px-8 mb-10 flex items-baseline justify-between">
        <h2 className="font-display text-3xl sm:text-4xl text-bone">The Archive</h2>
        <span className="font-mono text-[11px] tracking-widest text-grey">
          {filter === "all" ? `${photos.length} FRAMES` : filter.toUpperCase()}
        </span>
      </div>

      <MasonryGallery photos={photos} filter={filter} />

      {isAdmin && user && (
        <UploadModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          user={user}
          onUploaded={refresh}
        />
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <footer className="border-t border-surface-line/10 px-5 sm:px-8 py-10">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span className="font-display text-base text-bone">
            SARA<span className="text-gold">.</span>
          </span>
          <span className="font-mono text-[11px] tracking-widest text-grey">
            ARCHIVE — CAIRO · ISTANBUL · NORTH COAST
          </span>
        </div>
      </footer>
    </main>
  );
}
