import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const newsItems = [
  {
    id: 1,
    title: "Annual Sports Week 2081",
    excerpt: "Join us for a week of athletic excellence and team spirit. Students from all levels will participate in various sports events.",
    date: "Poush 15, 2081",
    category: "Events",
    image: "https://images.unsplash.com/photo-1461896836934- voices-537f2-unsplash?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "Science Exhibition Winners",
    excerpt: "Congratulations to our students who won first prize at the district-level science exhibition with their innovative solar project.",
    date: "Mangsir 28, 2081",
    category: "Achievement",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "New Computer Lab Inauguration",
    excerpt: "We are proud to announce the opening of our new state-of-the-art computer laboratory with 30 modern computers.",
    date: "Mangsir 20, 2081",
    category: "News",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
  },
];

const NewsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 bg-gradient-subtle" ref={ref}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Stay Updated
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Latest <span className="text-primary">News & Events</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stay connected with the latest happenings, achievements, and upcoming events at our school.
          </p>
        </motion.div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
          {newsItems.map((item, index) => (
            <motion.article
              key={item.id}
              className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                  <Calendar className="w-4 h-4" />
                  <span>{item.date}</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {item.excerpt}
                </p>
                <Link 
                  to={`/news/${item.id}`}
                  className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all"
                >
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button variant="outline" size="lg" asChild>
            <Link to="/news">
              View All News
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsSection;
