import { Helmet } from "react-helmet-async";
import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import PrincipalMessage from "@/components/home/PrincipalMessage";
import FacilitiesSection from "@/components/home/FacilitiesSection";
import NewsSection from "@/components/home/NewsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Shree Durga Saraswati Janata Secondary School | Excellence in Education</title>
        <meta 
          name="description" 
          content="Welcome to Shree Durga Saraswati Janata Secondary School - A premier educational institution in Nepal offering quality education from primary to secondary level. Admissions open for 2081/82." 
        />
        <meta name="keywords" content="school, education, Nepal, secondary school, admission, Durga Saraswati, Janata School" />
        <link rel="canonical" href="https://sdsjss.edu.np" />
      </Helmet>
      
      <MainLayout>
        <HeroSection />
        <StatsSection />
        <PrincipalMessage />
        <FacilitiesSection />
        <NewsSection />
        <TestimonialsSection />
        <CTASection />
      </MainLayout>
    </>
  );
};

export default Index;
