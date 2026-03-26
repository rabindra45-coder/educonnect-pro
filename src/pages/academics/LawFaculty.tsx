import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { Scale, BookText, Users, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LawFaculty = () => {
  const subjects = [
    "Jurisprudence",
    "Constitutional Law",
    "Business Law",
    "Sociology",
    "Political Science",
    "Economics",
    "English",
    "Nepali",
  ];

  const careers = [
    "Bachelor of Law (LLB)",
    "Judiciary Services",
    "Public Administration",
    "Corporate Law",
    "Human Rights Advocacy",
    "Diplomatic Services",
    "Civil Services",
    "Legal Consultancy",
  ];

  const features = [
    {
      icon: Scale,
      title: "Moot Court",
      description: "Regular moot court sessions to develop argumentation and advocacy skills.",
    },
    {
      icon: BookText,
      title: "Legal Research",
      description: "Comprehensive legal library and guided research methodology training.",
    },
    {
      icon: Users,
      title: "Guest Lectures",
      description: "Sessions by practicing advocates, judges, and legal scholars.",
    },
    {
      icon: Shield,
      title: "NEB + Entrance Prep",
      description: "Dual preparation for NEB exams and law entrance examinations.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Law Faculty (Class 11-12) | Milestone International S.S & College</title>
        <meta
          name="description"
          content="Law faculty at Milestone International College for Class 11-12 with comprehensive legal studies, moot courts, and preparation for law entrance exams."
        />
      </Helmet>

      <MainLayout>
        {/* Hero */}
        <section className="relative py-24 bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="bg-secondary/20 text-secondary border-0 mb-4 text-sm">Class 11-12</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                Law Faculty
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Build the foundation for a career in justice, governance, and legal excellence.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Subjects & Careers */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <BookText className="w-6 h-6 text-primary" /> Subjects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map(s => (
                        <Badge key={s} variant="secondary" className="text-sm py-1.5 px-3">{s}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Scale className="w-6 h-6 text-primary" /> Career Pathways
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {careers.map(c => (
                        <Badge key={c} variant="outline" className="text-sm py-1.5 px-3">{c}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">Why Law at Milestone?</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div key={feature.title} className="bg-card p-6 rounded-xl shadow-card" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                  <feature.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-card rounded-2xl p-8 shadow-card">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">Class Schedule</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">College Hours</p>
                  <p className="font-semibold text-foreground">6:30 AM - 12:30 PM</p>
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

export default LawFaculty;
