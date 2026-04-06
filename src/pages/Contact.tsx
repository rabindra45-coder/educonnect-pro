import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, CheckCircle, ChevronRight, Home } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().max(20).optional(),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || null,
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    });

    if (error) {
      toast.error("Failed to send message. Please try again.");
    } else {
      setSubmitted(true);
      toast.success("Message sent successfully!");
    }
    setIsSubmitting(false);
  };

  const contactInfo = [
    { icon: <Phone className="w-5 h-5" />, title: "Phone", details: ["+977 01-5186382", "+977-9746834671"] },
    { icon: <Mail className="w-5 h-5" />, title: "Email", details: ["info@milestonecollege.edu.np", "admission@milestonecollege.edu.np"] },
    { icon: <MapPin className="w-5 h-5" />, title: "Address", details: ["Balkumar, Lalitpur", "Bagmati Province, Nepal"] },
    { icon: <Clock className="w-5 h-5" />, title: "Office Hours", details: ["Sunday – Friday", "10:00 AM – 4:00 PM"] },
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us | Milestone International College</title>
        <meta name="description" content="Get in touch with Milestone International College for admissions, inquiries, or campus visits." />
      </Helmet>
      
      <MainLayout>
        {/* Hero */}
        <section className="relative py-20 sm:py-24 bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div className="max-w-3xl mx-auto text-center" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">Contact Us</h1>
              <p className="text-primary-foreground/80 text-lg">We'd love to hear from you. Reach out for any inquiries.</p>
            </motion.div>
          </div>
        </section>

        {/* Breadcrumbs */}
        <div className="bg-muted/50 border-b border-border/50">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="flex items-center gap-1 hover:text-foreground transition-colors"><Home className="w-3.5 h-3.5" /> Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-foreground font-medium">Contact</span>
            </nav>
          </div>
        </div>

        {/* Content */}
        <section className="py-16 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Left: Contact info */}
              <div className="space-y-5">
                {contactInfo.map((info, index) => (
                  <motion.div key={info.title} className="bg-card p-5 rounded-xl shadow-sm border border-border/50" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">{info.icon}</div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1 text-sm">{info.title}</h3>
                        {info.details.map((d, i) => <p key={i} className="text-muted-foreground text-sm">{d}</p>)}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* WhatsApp */}
                <motion.div className="bg-primary p-5 rounded-xl text-primary-foreground" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                  <MessageCircle className="w-7 h-7 text-secondary mb-3" />
                  <h3 className="font-semibold text-lg mb-1">Quick Connect</h3>
                  <p className="text-primary-foreground/80 text-sm mb-3">Chat with us on WhatsApp for quick responses.</p>
                  <Button variant="hero" size="sm" asChild>
                    <a target="_blank" rel="noopener noreferrer" href="https://wa.me/9779746834671">WhatsApp Us</a>
                  </Button>
                </motion.div>
              </div>

              {/* Right: Form */}
              <motion.div className="lg:col-span-2 bg-card p-6 sm:p-8 rounded-2xl shadow-sm border border-border/50" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                {submitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">Message Sent!</h2>
                    <p className="text-muted-foreground mb-6">We'll get back to you within 24 hours.</p>
                    <Button onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", phone: "", subject: "", message: "" }); }}>Send Another</Button>
                  </div>
                ) : (
                  <>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-6">Send Us a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
                          <Input name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required className="h-11" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
                          <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required className="h-11" />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                          <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+977-XXX-XXXXXXX" className="h-11" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">Subject *</label>
                          <Input name="subject" value={formData.subject} onChange={handleChange} placeholder="How can we help?" required className="h-11" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Message *</label>
                        <Textarea name="message" value={formData.message} onChange={handleChange} placeholder="Write your message..." required rows={5} />
                      </div>
                      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
                        {isSubmitting ? "Sending..." : <><Send className="w-4 h-4 mr-2" /> Send Message</>}
                      </Button>
                    </form>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map */}
        <section className="pb-16 bg-background">
          <div className="container mx-auto px-4">
            <motion.div className="rounded-2xl overflow-hidden shadow-sm border border-border/50" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3533.5!2d85.3!3d27.66!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDM5JzM2LjAiTiA4NcKwMTgnMDAuMCJF!5e0!3m2!1sen!2snp!4v1"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Milestone International College Location"
              />
            </motion.div>
          </div>
        </section>
      </MainLayout>
    </>
  );
};

export default Contact;
