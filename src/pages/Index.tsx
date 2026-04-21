import { Helmet } from "react-helmet-async";
import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import PrincipalMessage from "@/components/home/PrincipalMessage";
import FacilitiesSection from "@/components/home/FacilitiesSection";
import NewsSection from "@/components/home/NewsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";
import ChatBubble from "@/components/chat/ChatBubble";
import DashboardQuickAccess from "@/components/home/DashboardQuickAccess";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Milestone International S.S & College | Excellence in Higher Secondary Education</title>
        <meta 
          name="description" 
          content="Welcome to Milestone International S.S & College - A premier +2 college in Nepal offering Science, Management, and Law faculties for Class 11-12. Admissions open for 2081/82." 
        />
        <meta name="keywords" content="college, +2, higher secondary, Nepal, Science, Management, Law, Milestone International, Class 11, Class 12" />
        <link rel="canonical" href="https://milestonecollege.edu.np" />
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
      <ChatBubble />
      <DashboardQuickAccess />
    </>
  );
};

export default Index;
