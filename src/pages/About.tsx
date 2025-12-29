import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Target, Eye, Heart, BookOpen, Users, Award, Building2, Shield } from "lucide-react";
import principalImage from "@/assets/principal.jpg";
import heroImage from "@/assets/hero-school.jpg";

const About = () => {
  const historyRef = useRef(null);
  const visionRef = useRef(null);
  const leadershipRef = useRef(null);
  
  const historyInView = useInView(historyRef, { once: true, margin: "-100px" });
  const visionInView = useInView(visionRef, { once: true, margin: "-100px" });
  const leadershipInView = useInView(leadershipRef, { once: true, margin: "-100px" });

  const values = [
    { icon: <BookOpen className="w-6 h-6" />, title: "Academic Excellence", description: "Commitment to the highest standards of education and learning outcomes." },
    { icon: <Heart className="w-6 h-6" />, title: "Moral Values", description: "Instilling strong ethical principles and character development." },
    { icon: <Users className="w-6 h-6" />, title: "Inclusive Community", description: "Creating a welcoming environment for students from all backgrounds." },
    { icon: <Shield className="w-6 h-6" />, title: "Safe Environment", description: "Ensuring physical and emotional safety for all our students." },
  ];

  const leaders = [
    { name: "Mr. Ram Bahadur Sharma", role: "Principal", experience: "25+ years", image: principalImage },
    { name: "Mrs. Sita Kumari Thapa", role: "Vice Principal", experience: "20+ years", image: principalImage },
    { name: "Mr. Hari Prasad Gautam", role: "Head Teacher", experience: "18+ years", image: principalImage },
  ];

  return (
    <>
      <Helmet>
        <title>About Us | Shree Durga Saraswati Janata Secondary School</title>
        <meta 
          name="description" 
          content="Learn about Shree Durga Saraswati Janata Secondary School's history, vision, mission, and leadership. Discover our commitment to quality education in Nepal." 
        />
      </Helmet>
      
      <MainLayout>
        {/* Page Header */}
        <section className="relative py-24 bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img src={heroImage} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-hero"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
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
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={historyInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8 }}
              >
                <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Our Journey
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                  A Legacy of <span className="text-primary">Excellence</span>
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Shree Durga Saraswati Janata Secondary School was established in 20XX with a vision 
                    to provide quality education to the children of our community. What started as a 
                    small school with just a handful of students has grown into one of the most 
                    respected educational institutions in the region.
                  </p>
                  <p>
                    Over the years, we have produced countless successful alumni who have gone on to 
                    excel in various fields including medicine, engineering, civil services, and business. 
                    Our commitment to academic excellence, combined with a focus on character development, 
                    has made us the preferred choice for parents seeking holistic education for their children.
                  </p>
                  <p>
                    Today, we continue to uphold the founding principles while embracing modern teaching 
                    methodologies and technologies to prepare our students for the challenges of the 21st century.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 50 }}
                animate={historyInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={heroImage}
                    alt="School Campus"
                    className="w-full aspect-video object-cover"
                  />
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
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={visionInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Vision & <span className="text-primary">Mission</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <motion.div
                className="bg-card p-8 rounded-2xl shadow-card border border-border/50"
                initial={{ opacity: 0, y: 30 }}
                animate={visionInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Eye className="w-7 h-7" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To be a leading educational institution that nurtures young minds to become 
                  responsible global citizens, equipped with knowledge, skills, and values to 
                  contribute positively to society and lead fulfilling lives.
                </p>
              </motion.div>

              <motion.div
                className="bg-card p-8 rounded-2xl shadow-card border border-border/50"
                initial={{ opacity: 0, y: 30 }}
                animate={visionInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="w-14 h-14 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary mb-6">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-4">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To provide quality education that fosters academic excellence, creativity, 
                  critical thinking, and moral values. We are committed to creating a nurturing 
                  environment where every student can discover and develop their unique potential.
                </p>
              </motion.div>
            </div>

            {/* Core Values */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={visionInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="font-display text-2xl font-bold text-foreground">Core Values</h3>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  className="bg-card p-6 rounded-xl shadow-card border border-border/50 text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={visionInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                >
                  <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {value.icon}
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{value.title}</h4>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership Section */}
        <section id="leadership" className="py-20 bg-background" ref={leadershipRef}>
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={leadershipInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
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

            <div className="grid md:grid-cols-3 gap-8">
              {leaders.map((leader, index) => (
                <motion.div
                  key={leader.name}
                  className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group"
                  initial={{ opacity: 0, y: 30 }}
                  animate={leadershipInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={leader.image}
                      alt={leader.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                      {leader.name}
                    </h3>
                    <p className="text-primary font-medium mb-2">{leader.role}</p>
                    <p className="text-sm text-muted-foreground">{leader.experience} Experience</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Infrastructure Section */}
        <section id="infrastructure" className="py-20 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                Infrastructure
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our <span className="text-primary">Facilities</span>
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Building2 />, title: "Modern Buildings", count: "4" },
                { icon: <BookOpen />, title: "Classrooms", count: "30+" },
                { icon: <Award />, title: "Science Labs", count: "3" },
                { icon: <Users />, title: "Library Books", count: "5000+" },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  className="bg-card p-6 rounded-xl shadow-card text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {item.icon}
                  </div>
                  <div className="font-display text-3xl font-bold text-foreground mb-2">{item.count}</div>
                  <p className="text-muted-foreground">{item.title}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </MainLayout>
    </>
  );
};

export default About;
