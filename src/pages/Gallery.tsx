import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { X, ChevronLeft, ChevronRight, Home, ZoomIn, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const albums = [
  { id: "all", name: "All Photos" },
  { id: "campus", name: "Campus" },
  { id: "events", name: "Events" },
  { id: "sports", name: "Sports" },
  { id: "academics", name: "Academics" },
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

  const navigateLightbox = (dir: number) => {
    if (lightboxIndex === null) return;
    const next = lightboxIndex + dir;
    if (next >= 0 && next < filteredImages.length) setLightboxIndex(next);
  };

  return (
    <>
      <Helmet>
        <title>Photo Gallery | Milestone International College</title>
        <meta name="description" content="Explore our gallery showcasing campus life, events, sports, and academic activities." />
      </Helmet>
      
      <MainLayout>
        {/* Hero */}
        <section className="relative py-20 sm:py-24 bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div className="text-center max-w-3xl mx-auto" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Photo Gallery</h1>
              <p className="text-lg text-primary-foreground/80">Capturing moments and memories from our campus life.</p>
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

        {/* Gallery */}
        <section className="py-12 sm:py-16 bg-background">
          <div className="container mx-auto px-4">
            {/* Album filter tabs */}
            <motion.div className="flex flex-wrap justify-center gap-2 mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {albums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => setSelectedAlbum(album.id)}
                  className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                    selectedAlbum === album.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-primary/10"
                  }`}
                >
                  {album.name}
                  {album.id !== "all" && (
                    <span className="ml-1.5 text-xs opacity-60">
                      ({images.filter(i => album.id === "all" ? true : i.album === album.id).length})
                    </span>
                  )}
                </button>
              ))}
            </motion.div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredImages.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No images in this album yet.</p>
              </div>
            ) : (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {filteredImages.map((image, index) => (
                  <motion.div
                    key={image.id}
                    className="relative rounded-xl overflow-hidden cursor-pointer group break-inside-avoid"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.03 }}
                    onClick={() => setLightboxIndex(index)}
                  >
                    <img
                      src={image.image_url}
                      alt={image.title}
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-card text-sm font-medium">{image.title}</p>
                        <p className="text-card/60 text-xs capitalize">{image.album}</p>
                      </div>
                      <div className="absolute top-3 right-3">
                        <ZoomIn className="w-5 h-5 text-card/80" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Lightbox with navigation */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <motion.div
              className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxIndex(null)}
            >
              <button className="absolute top-4 right-4 w-12 h-12 rounded-full bg-card/10 flex items-center justify-center text-card hover:bg-card/20 transition-colors z-10" onClick={() => setLightboxIndex(null)}>
                <X className="w-6 h-6" />
              </button>

              {lightboxIndex > 0 && (
                <button className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/10 flex items-center justify-center text-card hover:bg-card/20 z-10" onClick={(e) => { e.stopPropagation(); navigateLightbox(-1); }}>
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {lightboxIndex < filteredImages.length - 1 && (
                <button className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-card/10 flex items-center justify-center text-card hover:bg-card/20 z-10" onClick={(e) => { e.stopPropagation(); navigateLightbox(1); }}>
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

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
                  className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain"
                />
                <p className="text-card/80 text-sm mt-3 font-medium">{filteredImages[lightboxIndex].title}</p>
              </motion.div>

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-card/50 text-sm">
                {lightboxIndex + 1} / {filteredImages.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </MainLayout>
    </>
  );
};

export default Gallery;
