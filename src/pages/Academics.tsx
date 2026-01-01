import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { GraduationCap, BookOpen, Award, Calendar, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const academicSections = [
  {
    title: "Primary Level",
    description: "Foundation education for grades 1-5 with focus on basic literacy, numeracy, and character development.",
    icon: BookOpen,
    path: "/academics/primary",
    grades: "Grade 1-5",
  },
  {
    title: "Lower Secondary",
    description: "Intermediate education for grades 6-8 bridging foundational and advanced learning.",
    icon: GraduationCap,
    path: "/academics/lower-secondary",
    grades: "Grade 6-8",
  },
  {
    title: "Secondary Level",
    description: "SEE preparation program for grades 9-10 with comprehensive exam-focused curriculum.",
    icon: Award,
    path: "/academics/secondary",
    grades: "Grade 9-10",
  },
  {
    title: "Exam Results",
    description: "Access examination results and academic performance reports for all classes.",
    icon: FileText,
    path: "/academics/results",
    grades: "All Classes",
  },
  {
    title: "Academic Calendar",
    description: "View important dates, exam schedules, holidays, and school events.",
    icon: Calendar,
    path: "/academics/calendar",
    grades: "2081/82",
  },
];

const Academics = () => {
  return (
    <>
      <Helmet>
        <title>Academics | Shree Durga Saraswati Janata Secondary School</title>
        <meta
          name="description"
          content="Explore academic programs at SDSJSS including Primary, Lower Secondary, and Secondary levels with comprehensive curriculum and exam preparation."
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
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                Academics
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Comprehensive education from primary to secondary level, preparing students for academic excellence.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Academic Sections */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Our Academic Programs
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We offer quality education across all levels, following the national curriculum with enhanced teaching methodologies.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {academicSections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={section.path}>
                    <Card className="h-full hover:shadow-card-hover transition-all group cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <section.icon className="w-10 h-10 text-primary" />
                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                            {section.grades}
                          </span>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {section.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm mb-4">{section.description}</p>
                        <span className="inline-flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
                          Learn More
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Why Choose Our School
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Experienced Faculty", value: "25+", subtitle: "Qualified Teachers" },
                { title: "Student Success", value: "95%", subtitle: "SEE Pass Rate" },
                { title: "Modern Facilities", value: "10+", subtitle: "Learning Labs" },
                { title: "Years of Excellence", value: "20+", subtitle: "Serving Community" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  className="bg-card p-6 rounded-xl shadow-card text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                  <p className="font-semibold text-foreground">{stat.title}</p>
                  <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </MainLayout>
    </>
  );
};

export default Academics;
