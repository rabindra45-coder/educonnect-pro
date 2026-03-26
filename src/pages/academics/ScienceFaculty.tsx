import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { FlaskConical, Atom, Microscope, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ScienceFaculty = () => {
  const groups = [
    {
      name: "Physical Group",
      icon: Atom,
      description: "For students aspiring towards engineering, technology, and physical sciences.",
      subjects: ["Physics", "Chemistry", "Mathematics", "English", "Nepali"],
      careers: ["Engineering", "IT & Computer Science", "Architecture", "Aviation", "Data Science"],
    },
    {
      name: "Biology Group",
      icon: Stethoscope,
      description: "For students aspiring towards medical, health sciences, and biological research.",
      subjects: ["Physics", "Chemistry", "Biology", "English", "Nepali"],
      careers: ["MBBS / Medicine", "Nursing", "Pharmacy", "Biotechnology", "Veterinary Science"],
    },
  ];

  const features = [
    {
      icon: FlaskConical,
      title: "Advanced Laboratories",
      description: "Fully equipped Physics, Chemistry, and Biology labs for practical learning.",
    },
    {
      icon: Microscope,
      title: "Research Projects",
      description: "Guided research projects to develop scientific temperament and inquiry skills.",
    },
    {
      icon: Atom,
      title: "NEB Board Preparation",
      description: "Comprehensive coaching for NEB exams with regular mock tests and model questions.",
    },
    {
      icon: Stethoscope,
      title: "Entrance Coaching",
      description: "Integrated preparation for IOE, IOM, CEE, and other competitive entrance exams.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Science Faculty (Class 11-12) | Milestone International S.S & College</title>
        <meta
          name="description"
          content="Science faculty at Milestone International College offering Physical and Biology groups for Class 11-12 with advanced labs and entrance exam preparation."
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
                Science Faculty
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Unlock the world of scientific discovery with our rigorous Physical and Biology programs.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Groups */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">Specialization Groups</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Choose the path that aligns with your career aspirations.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {groups.map((group, index) => (
                <motion.div key={group.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }}>
                  <Card className="h-full hover:shadow-card-hover transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <group.icon className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">{group.name}</CardTitle>
                      </div>
                      <p className="text-muted-foreground mt-2">{group.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Subjects</h4>
                        <div className="flex flex-wrap gap-2">
                          {group.subjects.map(s => (
                            <Badge key={s} variant="secondary" className="text-sm">{s}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Career Pathways</h4>
                        <div className="flex flex-wrap gap-2">
                          {group.careers.map(c => (
                            <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">Why Science at Milestone?</h2>
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

export default ScienceFaculty;
