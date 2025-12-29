import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import classroomImg from "@/assets/classroom.jpg";
import sportsImg from "@/assets/sports.jpg";
import libraryImg from "@/assets/library.jpg";

const facilities = [
  {
    title: "Modern Classrooms",
    description: "Spacious, well-lit classrooms equipped with modern teaching aids for effective learning.",
    image: classroomImg,
  },
  {
    title: "Sports Facilities",
    description: "Large playground and sports equipment for football, volleyball, and other activities.",
    image: sportsImg,
  },
  {
    title: "Library & Resources",
    description: "Well-stocked library with thousands of books, journals, and digital resources.",
    image: libraryImg,
  },
];

const FacilitiesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 bg-background" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Our Facilities
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            World-Class <span className="text-primary">Infrastructure</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We provide state-of-the-art facilities to ensure our students have the best learning environment.
          </p>
        </motion.div>

        {/* Facilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((facility, index) => (
            <motion.div
              key={facility.title}
              className="group relative rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              {/* Image */}
              <div className="relative h-72 overflow-hidden">
                <img
                  src={facility.image}
                  alt={facility.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-display text-xl font-semibold text-card mb-2">
                  {facility.title}
                </h3>
                <p className="text-card/80 text-sm leading-relaxed">
                  {facility.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacilitiesSection;
