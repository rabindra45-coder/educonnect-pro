import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Message sent successfully! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    });
    setIsSubmitting(false);
  };
  const contactInfo = [{
    icon: <Phone className="w-6 h-6" />,
    title: "Phone",
    details: ["+977-XXX-XXXXXXX", "+977-XXX-XXXXXXX"]
  }, {
    icon: <Mail className="w-6 h-6" />,
    title: "Email",
    details: ["info@sdsjss.edu.np", "admission@sdsjss.edu.np"]
  }, {
    icon: <MapPin className="w-6 h-6" />,
    title: "Address",
    details: ["Ward No. X, Municipality", "District, Province, Nepal"]
  }, {
    icon: <Clock className="w-6 h-6" />,
    title: "Office Hours",
    details: ["Sunday - Friday", "10:00 AM - 4:00 PM"]
  }];
  return <>
      <Helmet>
        <title>Contact Us | Shree Durga Saraswati Janata Secondary School</title>
        <meta name="description" content="Get in touch with Shree Durga Saraswati Janata Secondary School. Contact us for admissions, inquiries, or to schedule a campus visit." />
      </Helmet>
      
      <MainLayout>
        {/* Page Header */}
        <section className="relative py-24 bg-primary overflow-hidden">
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
                Contact Us
              </h1>
              <p className="text-lg text-primary-foreground/80">
                We'd love to hear from you. Get in touch with us for any inquiries or to schedule a visit.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Contact Info Cards */}
              <div className="lg:col-span-1 space-y-6">
                {contactInfo.map((info, index) => <motion.div key={info.title} className="bg-card p-6 rounded-xl shadow-card border border-border/50" initial={{
                opacity: 0,
                x: -30
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                duration: 0.6,
                delay: index * 0.1
              }}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{info.title}</h3>
                        {info.details.map((detail, i) => <p key={i} className="text-muted-foreground text-sm">{detail}</p>)}
                      </div>
                    </div>
                  </motion.div>)}

                {/* Quick Contact */}
                <motion.div className="bg-primary p-6 rounded-xl text-primary-foreground" initial={{
                opacity: 0,
                x: -30
              }} animate={{
                opacity: 1,
                x: 0
              }} transition={{
                duration: 0.6,
                delay: 0.4
              }}>
                  <MessageCircle className="w-8 h-8 text-secondary mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Quick Connect</h3>
                  <p className="text-primary-foreground/80 text-sm mb-4">
                    Chat with us directly on WhatsApp for quick responses.
                  </p>
                  <Button variant="hero" size="sm" asChild>
                    <a target="_blank" rel="noopener noreferrer" href="https://wa.me/9779746834671">
                      WhatsApp Us
                    </a>
                  </Button>
                </motion.div>
              </div>

              {/* Contact Form */}
              <motion.div className="lg:col-span-2 bg-card p-8 rounded-2xl shadow-card border border-border/50" initial={{
              opacity: 0,
              x: 30
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              duration: 0.6,
              delay: 0.2
            }}>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  Send Us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Full Name *
                      </label>
                      <Input name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required className="h-12" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Address *
                      </label>
                      <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required className="h-12" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number
                      </label>
                      <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+977-XXX-XXXXXXX" className="h-12" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Subject *
                      </label>
                      <Input name="subject" value={formData.subject} onChange={handleChange} placeholder="How can we help?" required className="h-12" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <Textarea name="message" value={formData.message} onChange={handleChange} placeholder="Write your message here..." required rows={5} />
                  </div>

                  <Button type="submit" variant="default" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? "Sending..." : <>
                        Send Message
                        <Send className="w-4 h-4 ml-2" />
                      </>}
                  </Button>
                </form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-10 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <motion.div className="rounded-2xl overflow-hidden shadow-lg" initial={{
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
              <div className="bg-muted h-96 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Google Maps integration would go here
                  </p>
                  <p className="text-sm text-muted-foreground/70">
                    (Requires Google Maps API key)
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </MainLayout>
    </>;
};
export default Contact;