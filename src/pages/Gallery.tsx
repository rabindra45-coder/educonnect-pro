import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { X, ChevronLeft, ChevronRight, Home, ZoomIn, Loader2, Grid3X3, LayoutGrid, Download, Images } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const albums = [
  { id: "all", name: "All Photos", icon: Images },
  { id: "campus", name: "Campus", icon: LayoutGrid },
  { id: "events", name: "Events", icon: Grid3X3 },
  { id: "sports", name: "Sports", icon: Grid3X3 },
  { id: "academics", name: "Academics", icon: Grid3X3 },
];

interface GalleryImage {
  id: string;
  title: string;
  album: string;
  image_url: string;
}

const Gallery = () => {
  const [selectedAlbum, setSelectedAlbum] = useState("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"masonry" | "grid">("masonry");

  useEffect(() => {
    supabase
      .from("gallery_images")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setImages(data);
        setLoading(false);
      });
  }, []);

  const filteredImages = selectedAlbum === "all" ? images : images.filter(img => img.album === selectedAlbum);

  const navigateLightbox = useCallback((dir: number) => {
    setLightboxIndex(prev => {
      if (prev === null) return null;
      const next = prev + dir;
      if (next >= 0 && next < filteredImages.length) return next;
      return prev;
    });
  }, [filteredImages.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowLeft") navigateLightbox(-1);
      if (e.key === "ArrowRight") navigateLightbox(1);
      if (e.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxIndex, navigateLightbox]);

  const albumCounts = albums.map(a => ({
    ...a,
    count: a.id === "all" ? images.length : images.filter(i => i.album === a.id).length,
  }));

  return (
    <>
      <Helmet>
        <title>Photo Gallery | Milestone International College</title>
        <meta name="description" content="Explore our gallery showcasing campus life, events, sports, and academic activities." />
      </Helmet>

      <MainLayout>
        {/* Hero */}
        <section className="relative py-20 sm:py-28 bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-primary-foreground/30 rounded-full" />
            <div className="absolute bottom-10 right-20 w-48 h-48 border-2 border-primary-foreground/20 rounded-full" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div className="text-center max-w-3xl mx-auto" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 mb-5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Images className="w-3.5 h-3.5 text-primary-foreground" />
                <span className="text-primary-foreground text-xs font-semibold uppercase tracking-widest">Gallery</span>
              </motion.div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4">
                Our Photo <span className="italic">Gallery</span>
              </h1>
              <p className="text-lg text-primary-foreground/80">Capturing moments and memories from our vibrant campus life.</p>
            </motion.div>
          </div>
        </section>

        {/* Breadcrumb */}
        <div className="bg-muted/50 border-b border-border/50">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="flex items-center gap-1 hover:text-foreground"><Home className="w-3.5 h-3.5" /> Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">Gallery</span>
            </nav>
          </div>
        </div>

        {/* Album Stats Cards */}
        <section className="py-8 bg-background border-b border-border/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {albumCounts.map((album) => (
                <motion.button
                  key={album.id}
                  onClick={() => setSelectedAlbum(album.id)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${
                    selectedAlbum === album.id
                      ? "bg-primary/10 border-primary/30 shadow-md"
                      : "bg-card border-border/50 hover:border-primary/20 hover:shadow-sm"
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <album.icon className={`w-5 h-5 ${selectedAlbum === album.id ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-medium ${selectedAlbum === album.id ? "text-primary" : "text-foreground"}`}>
                    {album.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedAlbum === album.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {album.count}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="py-12 sm:py-16 bg-background">
          <div className="container mx-auto px-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredImages.length}</span> photos
                {selectedAlbum !== "all" && <> in <span className="font-semibold text-foreground capitalize">{selectedAlbum}</span></>}
              </p>
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode("masonry")}
                  className={`p-2 rounded-md transition-colors ${viewMode === "masonry" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredImages.length === 0 ? (
              <motion.div
                className="text-center py-20 bg-muted/30 rounded-2xl border border-border/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Images className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No photos in this album yet.</p>
                <p className="text-sm text-muted-foreground/60 mt-1">Check back later for updates!</p>
              </motion.div>
            ) : viewMode === "masonry" ? (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {filteredImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    className="relative rounded-xl overflow-hidden cursor-pointer group break-inside-avoid"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.02 }}
                    onClick={() => setLightboxIndex(index)}
                  >
                    <img
                      src={image.image_url}
                      alt={image.title}
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.parentElement!.classList.add("min-h-[200px]", "bg-muted", "flex", "items-center", "justify-center");
                        const span = document.createElement("span");
                        span.className = "text-muted-foreground text-sm p-4 text-center";
                        span.textContent = image.title;
                        target.parentElement!.appendChild(span);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-card text-sm font-semibold">{image.title}</p>
                        <p className="text-card/60 text-xs capitalize mt-0.5">{image.album}</p>
                      </div>
                      <div className="absolute top-3 right-3 flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center">
                          <ZoomIn className="w-4 h-4 text-card" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.02 }}
                    onClick={() => setLightboxIndex(index)}
                  >
                    <img
                      src={image.image_url}
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.parentElement!.classList.add("bg-muted", "flex", "items-center", "justify-center");
                        const span = document.createElement("span");
                        span.className = "text-muted-foreground text-xs p-2 text-center";
                        span.textContent = image.title;
                        target.parentElement!.appendChild(span);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-card text-sm font-semibold truncate">{image.title}</p>
                        <p className="text-card/60 text-xs capitalize">{image.album}</p>
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className="w-8 h-8 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center">
                          <ZoomIn className="w-4 h-4 text-card" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              className="fixed inset-0 z-50 bg-foreground/95 backdrop-blur-sm flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxIndex(null)}
            >
              {/* Close */}
              <button className="absolute top-4 right-4 w-12 h-12 rounded-full bg-card/10 hover:bg-card/20 flex items-center justify-center text-card transition-colors z-10" onClick={() => setLightboxIndex(null)}>
                <X className="w-6 h-6" />
              </button>

              {/* Download */}
              <a
                href={filteredImages[lightboxIndex]?.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 right-20 w-12 h-12 rounded-full bg-card/10 hover:bg-card/20 flex items-center justify-center text-card transition-colors z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-5 h-5" />
              </a>

              {/* Nav arrows */}
              {lightboxIndex > 0 && (
                <button className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/10 hover:bg-card/20 flex items-center justify-center text-card z-10" onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}>
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {lightboxIndex < filteredImages.length - 1 && (
                <button className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/10 hover:bg-card/20 flex items-center justify-center text-card z-10" onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}>
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Image */}
              <motion.div
                key={lightboxIndex}
                className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={filteredImages[lightboxIndex].image_url}
                  alt={filteredImages[lightboxIndex].title}
                  className="max-w-full max-h-[78vh] rounded-lg shadow-2xl object-contain"
                />
                <div className="mt-3 text-center">
                  <p className="text-card text-sm font-semibold">{filteredImages[lightboxIndex].title}</p>
                  <p className="text-card/50 text-xs capitalize mt-0.5">{filteredImages[lightboxIndex].album}</p>
                </div>
              </motion.div>

              {/* Thumbnail strip */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                <span className="text-card/50 text-xs mr-2">{lightboxIndex + 1} / {filteredImages.length}</span>
                {filteredImages.slice(Math.max(0, lightboxIndex - 3), Math.min(filteredImages.length, lightboxIndex + 4)).map((img, i) => {
                  const realIndex = Math.max(0, lightboxIndex - 3) + i;
                  return (
                    <button
                      key={img.id}
                      className={`w-10 h-10 rounded-md overflow-hidden border-2 transition-all ${
                        realIndex === lightboxIndex ? "border-primary scale-110" : "border-transparent opacity-50 hover:opacity-80"
                      }`}
                      onClick={(e) => { e.stopPropagation(); setLightboxIndex(realIndex); }}
                    >
                      <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </MainLayout>
    </>
  );
};

export default Gallery;
