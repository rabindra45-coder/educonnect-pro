import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { X } from "lucide-react";
import classroomImg from "@/assets/classroom.jpg";
import sportsImg from "@/assets/sports.jpg";
import libraryImg from "@/assets/library.jpg";
import heroImg from "@/assets/hero-school.jpg";

const albums = [
  { id: "all", name: "All Photos" },
  { id: "campus", name: "Campus" },
  { id: "events", name: "Events" },
  { id: "sports", name: "Sports" },
  { id: "academics", name: "Academics" },
];

const galleryImages = [
  { id: 1, src: heroImg, title: "School Campus", album: "campus" },
  { id: 2, src: classroomImg, title: "Modern Classroom", album: "academics" },
  { id: 3, src: sportsImg, title: "Sports Day", album: "sports" },
  { id: 4, src: libraryImg, title: "Library", album: "academics" },
  { id: 5, src: heroImg, title: "Main Building", album: "campus" },
  { id: 6, src: classroomImg, title: "Science Lab", album: "academics" },
  { id: 7, src: sportsImg, title: "Football Match", album: "sports" },
  { id: 8, src: libraryImg, title: "Reading Room", album: "academics" },
];

const Gallery = () => {
  const [selectedAlbum, setSelectedAlbum] = useState("all");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const filteredImages = selectedAlbum === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.album === selectedAlbum);

  return (
    <>
      <Helmet>
        <title>Photo Gallery | Shree Durga Saraswati Janata Secondary School</title>
        <meta 
          name="description" 
          content="Explore our photo gallery showcasing school events, sports activities, academic achievements, and campus life at Shree Durga Saraswati Janata Secondary School." 
        />
      </Helmet>
      
      <MainLayout>
        {/* Page Header */}
        <section className="relative py-24 bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                Photo Gallery
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Capturing moments and memories from our school life.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            {/* Album Filters */}
            <motion.div
              className="flex flex-wrap justify-center gap-3 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {albums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => setSelectedAlbum(album.id)}
                  className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 ${
                    selectedAlbum === album.id
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-primary/10"
                  }`}
                >
                  {album.name}
                </button>
              ))}
            </motion.div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  onClick={() => setLightboxImage(image.src)}
                >
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-card text-sm font-medium">{image.title}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Lightbox */}
        {lightboxImage && (
          <motion.div
            className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setLightboxImage(null)}
          >
            <button
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-card/20 flex items-center justify-center text-card hover:bg-card/30 transition-colors"
              onClick={() => setLightboxImage(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              src={lightboxImage}
              alt="Gallery image"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </MainLayout>
    </>
  );
};

export default Gallery;
