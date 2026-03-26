import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { Briefcase, Monitor, Globe, UtensilsCrossed, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ManagementFaculty = () => {
  const streams = [
    {
      name: "Computer Science + Mathematics",
      icon: Monitor,
      description: "Blend of business acumen and technical expertise for the digital age.",
      subjects: ["Accountancy", "Business Studies", "Economics", "Computer Science", "Mathematics", "English", "Nepali"],
      careers: ["BBA / BIM", "Software Development", "Data Analytics", "Banking & Finance", "Entrepreneurship"],
    },
    {
      name: "Computer Science + Social Studies",
      icon: Globe,
      description: "Integration of technology skills with social science perspectives.",
      subjects: ["Accountancy", "Business Studies", "Economics", "Computer Science", "Social Studies", "English", "Nepali"],
      careers: ["BBA / BBS", "Public Administration", "Digital Marketing", "Social Enterprise", "NGO Management"],
    },
    {
      name: "Hotel Management (Sec A & B)",
      icon: UtensilsCrossed,
      description: "Professional hospitality training with practical exposure in two dedicated sections.",
      subjects: ["Hotel Management", "Food Production", "Front Office", "Housekeeping", "English", "Nepali", "Business Studies"],
      careers: ["Hotel Management", "Tourism Industry", "Event Management", "Airline & Cruise", "Restaurant Business"],
    },
  ];

  const features = [
    {
      icon: Briefcase,
      title: "Industry Exposure",
      description: "Internships, guest lectures, and industry visits with leading organizations.",
    },
    {
      icon: Calculator,
      title: "Practical Training",
      description: "Hands-on projects, case studies, and real-world business simulations.",
    },
    {
      icon: Monitor,
      title: "Computer Labs",
      description: "Modern computer labs with latest software for IT and business applications.",
    },
    {
      icon: UtensilsCrossed,
      title: "Hospitality Lab",
      description: "Fully equipped kitchen and front office lab for Hotel Management students.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Management Faculty (Class 11-12) | Milestone International S.S & College</title>
        <meta
          name="description"
          content="Management faculty at Milestone International College with Computer Science+Maths, Computer Science+Social, and Hotel Management streams for Class 11-12."
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
                Management Faculty
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Build your business foundation with specialized streams in technology, commerce, and hospitality.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Streams */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">Specialization Streams</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Three distinct pathways tailored to your career goals.</p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {streams.map((stream, index) => (
                <motion.div key={stream.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }}>
                  <Card className="h-full hover:shadow-card-hover transition-shadow">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                        <stream.icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{stream.name}</CardTitle>
                      <p className="text-muted-foreground text-sm mt-1">{stream.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2 text-sm">Subjects</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {stream.subjects.map(s => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-2 text-sm">Career Pathways</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {stream.careers.map(c => (
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
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">Why Management at Milestone?</h2>
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

export default ManagementFaculty;
