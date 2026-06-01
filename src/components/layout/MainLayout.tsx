import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import PublicBottomNav from "./PublicBottomNav";
import OfflineBanner from "@/components/OfflineBanner";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-dvh flex flex-col">
      <OfflineBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <PublicBottomNav />
    </div>
  );
};

export default MainLayout;
