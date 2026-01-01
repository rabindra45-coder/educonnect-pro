import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { BookOpen, Microscope, Globe, Calculator } from "lucide-react";

const LowerSecondary = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Advanced Curriculum",
      description: "Progressive curriculum building on primary foundations with deeper subject exploration.",
    },
    {
      icon: Microscope,
      title: "Science Labs",
      description: "Practical learning through well-equipped science laboratories.",
    },
    {
      icon: Globe,
      title: "Project-Based Learning",
      description: "Real-world projects that develop critical thinking and problem-solving skills.",
    },
    {
      icon: Calculator,
      title: "Skill Development",
      description: "Focus on developing analytical and creative skills for higher education.",
    },
  ];

  const subjects = [
    "Nepali",
    "English",
    "Mathematics",
    "Science & Technology",
    "Social Studies",
    "Health & Physical Education",
    "Occupation, Business & Technology",
    "Optional I",
    "Optional II",
  ];

  return (
    <>
      <Helmet>
        <title>Lower Secondary (Grade 6-8) | Shree Durga Saraswati Janata Secondary School</title>
        <meta
          name="description"
          content="Lower secondary education at SDSJSS for grades 6-8 with advanced curriculum, practical learning, and skill development programs."
        />
      </Helmet>

      <MainLayout>
        {/* Hero Section */}
        <section className="relative py-24 bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
                Grade 6-8
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                Lower Secondary Education
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Bridging foundational learning with advanced academic exploration and skill development.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Our Approach
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Preparing students for secondary education through comprehensive learning experiences.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="bg-card p-6 rounded-xl shadow-card hover:shadow-card-hover transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <feature.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Subjects Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Subjects Offered
              </h2>
              <p className="text-muted-foreground">
                Comprehensive subjects as per national curriculum framework.
              </p>
            </motion.div>

            <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
              {subjects.map((subject, index) => (
                <motion.span
                  key={subject}
                  className="px-5 py-2 bg-card rounded-full text-foreground font-medium shadow-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  {subject}
                </motion.span>
              ))}
            </div>
          </div>
        </section>

        {/* Schedule Info */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-card rounded-2xl p-8 shadow-card">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
                Class Schedule
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">School Hours</p>
                  <p className="font-semibold text-foreground">10:00 AM - 4:00 PM</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Days</p>
                  <p className="font-semibold text-foreground">Sunday - Friday</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </MainLayout>
    </>
  );
};

export default LowerSecondary;
