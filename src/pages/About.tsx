import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Target, Eye, Heart, BookOpen, Users, Award, Building2, Shield, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-school.jpg";
interface AboutContent {
  id: string;
  section_key: string;
  title: string | null;
  content: string | null;
}
interface Leader {
  id: string;
  name: string;
  role: string;
  experience: string | null;
  photo_url: string | null;
  display_order: number;
}
const About = () => {
  const historyRef = useRef(null);
  const visionRef = useRef(null);
  const leadershipRef = useRef(null);
  const historyInView = useInView(historyRef, {
    once: true,
    margin: "-100px"
  });
  const visionInView = useInView(visionRef, {
    once: true,
    margin: "-100px"
  });
  const leadershipInView = useInView(leadershipRef, {
    once: true,
    margin: "-100px"
  });
  const [aboutContent, setAboutContent] = useState<AboutContent[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      const [aboutRes, leadersRes] = await Promise.all([supabase.from("about_content").select("*"), supabase.from("leadership").select("*").eq("is_active", true).order("display_order")]);
      if (aboutRes.data) setAboutContent(aboutRes.data);
      if (leadersRes.data) setLeaders(leadersRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);
  const getContent = (sectionKey: string) => {
    const section = aboutContent.find(a => a.section_key === sectionKey);
    return section?.content || "";
  };
  const getTitle = (sectionKey: string) => {
    const section = aboutContent.find(a => a.section_key === sectionKey);
    return section?.title || "";
  };
  const values = [{
    icon: <BookOpen className="w-6 h-6" />,
    title: "Academic Excellence",
    description: "Commitment to the highest standards of education and learning outcomes."
  }, {
    icon: <Heart className="w-6 h-6" />,
    title: "Moral Values",
    description: "Instilling strong ethical principles and character development."
  }, {
    icon: <Users className="w-6 h-6" />,
    title: "Inclusive Community",
    description: "Creating a welcoming environment for students from all backgrounds."
  }, {
    icon: <Shield className="w-6 h-6" />,
    title: "Safe Environment",
    description: "Ensuring physical and emotional safety for all our students."
  }];

  // Default content if not in database
  const historyContent = getContent("history") || `Shree Durga Saraswati Janata Secondary School was established with a vision 
to provide quality education to the children of our community. What started as a 
small school with just a handful of students has grown into one of the most 
respected educational institutions in the region.

Over the years, we have produced countless successful alumni who have gone on to 
excel in various fields including medicine, engineering, civil services, and business. 
Our commitment to academic excellence, combined with a focus on character development, 
has made us the preferred choice for parents seeking holistic education for their children.

Today, we continue to uphold the founding principles while embracing modern teaching 
methodologies and technologies to prepare our students for the challenges of the 21st century.`;
  const visionContent = getContent("vision") || `To be a leading educational institution that nurtures young minds to become 
responsible global citizens, equipped with knowledge, skills, and values to 
contribute positively to society and lead fulfilling lives.`;
  const missionContent = getContent("mission") || `To provide quality education that fosters academic excellence, creativity, 
critical thinking, and moral values. We are committed to creating a nurturing 
environment where every student can discover and develop their unique potential.`;
  return <>
      <Helmet>
        <title>About Us | Shree Durga Saraswati Janata Secondary School</title>
        <meta name="description" content="Learn about Shree Durga Saraswati Janata Secondary School's history, vision, mission, and leadership. Discover our commitment to quality education in Nepal." />
      </Helmet>
      
      <MainLayout>
        {/* Page Header */}
        <section className="relative py-24 bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img src={heroImage} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-hero"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div className="text-center max-w-3xl mx-auto" initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8
          }}>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                About Our School
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Discover the story, vision, and values that make Shree Durga Saraswati Janata Secondary School 
                a leading educational institution.
              </p>
            </motion.div>
          </div>
        </section>

        {/* History Section */}
        <section id="history" className="py-20 bg-background" ref={historyRef}>
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{
              opacity: 0,
              x: -50
            }} animate={historyInView ? {
              opacity: 1,
              x: 0
            } : {}} transition={{
              duration: 0.8
            }}>
                <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Our Journey
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                  A Legacy of <span className="text-primary">Excellence</span>
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed whitespace-pre-line">
                  {historyContent}
                </div>
              </motion.div>

              <motion.div className="relative" initial={{
              opacity: 0,
              x: 50
            }} animate={historyInView ? {
              opacity: 1,
              x: 0
            } : {}} transition={{
              duration: 0.8,
              delay: 0.2
            }}>
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <img alt="School Campus" className="w-full aspect-video object-cover" src="/lovable-uploads/60cb4f72-bd3f-4adc-a435-fa690f978c01.jpg" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-secondary text-secondary-foreground p-6 rounded-2xl shadow-xl">
                  <div className="text-center">
                    <div className="font-display text-4xl font-bold">25+</div>
                    <div className="text-sm">Years of Excellence</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Vision & Mission Section */}
        <section id="vision" className="py-20 bg-gradient-subtle" ref={visionRef}>
          <div className="container mx-auto px-4">
            <motion.div className="text-center mb-12" initial={{
            opacity: 0,
            y: 30
          }} animate={visionInView ? {
            opacity: 1,
            y: 0
          } : {}} transition={{
            duration: 0.6
          }}>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Vision & <span className="text-primary">Mission</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <motion.div className="bg-card p-8 rounded-2xl shadow-card border border-border/50" initial={{
              opacity: 0,
              y: 30
            }} animate={visionInView ? {
              opacity: 1,
              y: 0
            } : {}} transition={{
              duration: 0.6,
              delay: 0.1
            }}>
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Eye className="w-7 h-7" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {visionContent}
                </p>
              </motion.div>

              <motion.div className="bg-card p-8 rounded-2xl shadow-card border border-border/50" initial={{
              opacity: 0,
              y: 30
            }} animate={visionInView ? {
              opacity: 1,
              y: 0
            } : {}} transition={{
              duration: 0.6,
              delay: 0.2
            }}>
                <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary mb-6">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {missionContent}
                </p>
              </motion.div>
            </div>

            {/* Core Values */}
            <motion.div className="text-center mb-8" initial={{
            opacity: 0,
            y: 30
          }} animate={visionInView ? {
            opacity: 1,
            y: 0
          } : {}} transition={{
            duration: 0.6,
            delay: 0.3
          }}>
              <h3 className="font-display text-2xl font-bold text-foreground">Core Values</h3>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => <motion.div key={value.title} className="bg-card p-6 rounded-xl shadow-card border border-border/50 text-center" initial={{
              opacity: 0,
              y: 30
            }} animate={visionInView ? {
              opacity: 1,
              y: 0
            } : {}} transition={{
              duration: 0.6,
              delay: 0.4 + index * 0.1
            }}>
                  <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {value.icon}
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </motion.div>)}
            </div>
          </div>
        </section>

        {/* Leadership Section */}
        <section id="leadership" className="py-20 bg-background" ref={leadershipRef}>
          <div className="container mx-auto px-4">
            <motion.div className="text-center mb-12" initial={{
            opacity: 0,
            y: 30
          }} animate={leadershipInView ? {
            opacity: 1,
            y: 0
          } : {}} transition={{
            duration: 0.6
          }}>
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Meet Our Leaders
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                School <span className="text-primary">Leadership</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our experienced leadership team is dedicated to providing the best educational experience for our students.
              </p>
            </motion.div>

            {loading ? <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div> : leaders.length === 0 ? <p className="text-center text-muted-foreground py-12">Leadership information coming soon.</p> : <div className="grid md:grid-cols-3 gap-8">
                {leaders.map((leader, index) => <motion.div key={leader.id} className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group" initial={{
              opacity: 0,
              y: 30
            }} animate={leadershipInView ? {
              opacity: 1,
              y: 0
            } : {}} transition={{
              duration: 0.6,
              delay: index * 0.1
            }}>
                    <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                      {leader.photo_url ? <img src={leader.photo_url} alt={leader.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-20 h-20 text-muted-foreground/30" />
                        </div>}
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                        {leader.name}
                      </h3>
                      <p className="text-primary font-medium mb-2">{leader.role}</p>
                      {leader.experience && <p className="text-sm text-muted-foreground">{leader.experience} Experience</p>}
                    </div>
                  </motion.div>)}
              </div>}
          </div>
        </section>

        {/* Infrastructure Section */}
        <section id="infrastructure" className="py-20 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <motion.div className="text-center mb-12" initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }}>
              <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                Infrastructure
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our <span className="text-primary">Facilities</span>
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[{
              icon: <Building2 />,
              title: "Modern Buildings",
              count: "4"
            }, {
              icon: <BookOpen />,
              title: "Classrooms",
              count: "30+"
            }, {
              icon: <Award />,
              title: "Science Labs",
              count: "3"
            }, {
              icon: <Users />,
              title: "Library Books",
              count: "5000+"
            }].map((item, index) => <motion.div key={item.title} className="bg-card p-6 rounded-xl shadow-card text-center" initial={{
              opacity: 0,
              y: 30
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6,
              delay: index * 0.1
            }}>
                  <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {item.icon}
                  </div>
                  <div className="font-display text-3xl font-bold text-foreground mb-2">{item.count}</div>
                  <p className="text-muted-foreground">{item.title}</p>
                </motion.div>)}
            </div>
          </div>
        </section>
      </MainLayout>
    </>;
};
export default About;