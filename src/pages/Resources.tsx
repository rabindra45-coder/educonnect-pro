import MainLayout from "@/components/layout/MainLayout";
import ResourceCenter from "@/components/resources/ResourceCenter";
import { Helmet } from "react-helmet-async";

const Resources = () => (
  <MainLayout>
    <Helmet>
      <title>Digital Resource Center | Milestone International College</title>
      <meta name="description" content="Browse and download notes, past papers, books, and study materials at Milestone International College." />
    </Helmet>
    <div className="container mx-auto px-4 py-6">
      <ResourceCenter />
    </div>
  </MainLayout>
);

export default Resources;
