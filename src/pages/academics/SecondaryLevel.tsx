import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { GraduationCap, FlaskConical, BookText, Users } from "lucide-react";

const SecondaryLevel = () => {
  const features = [
    {
      icon: GraduationCap,
      title: "SEE Preparation",
      description: "Focused preparation for Secondary Education Examination with regular mock tests.",
    },
    {
      icon: FlaskConical,
      title: "Advanced Labs",
      description: "State-of-the-art science and computer laboratories for practical learning.",
    },
    {
      icon: BookText,
      title: "Career Guidance",
      description: "Professional counseling to help students choose the right career path.",
    },
    {
      icon: Users,
      title: "Expert Faculty",
      description: "Experienced teachers specialized in SEE-level education and exam preparation.",
    },
  ];

  const subjects = [
    "Nepali",
    "English",
    "Mathematics",
    "Science",
    "Social Studies",
    "Health, Population & Environment",
    "Optional I (Computer/Accounting)",
    "Optional II",
  ];

  return (
    <>
      <Helmet>
        <title>Secondary Level (Grade 9-10) | Shree Durga Saraswati Janata Secondary School</title>
        <meta
          name="description"
          content="Secondary education at SDSJSS for grades 9-10 with SEE preparation, advanced laboratories, and career guidance programs."
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
                Grade 9-10
              </span>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                Secondary Level Education
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Preparing students for SEE and building a strong foundation for higher education.
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
                Excellence in education with focus on academic achievement and personal growth.
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
                Complete SEE curriculum with optional subjects.
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

        {/* SEE Info */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-card rounded-2xl p-8 shadow-card">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">
                SEE Preparation
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our Secondary Education Examination (SEE) preparation program includes:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Regular mock tests and model question practice</li>
                  <li>Extra classes for difficult subjects</li>
                  <li>Individual attention for struggling students</li>
                  <li>Past year question analysis and tips</li>
                  <li>Stress management and exam preparation workshops</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </MainLayout>
    </>
  );
};

export default SecondaryLevel;
