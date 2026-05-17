import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { GraduationCap, Heart, Users, Shield, Wallet, BookOpen, ArrowRight } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import schoolLogo from "@/assets/logo.png";

const PORTALS = [
  { key: "student",    title: "Student App",    desc: "Homework, results, fees & ID",     icon: GraduationCap, accent: "from-blue-600 to-indigo-700" },
  { key: "parent",     title: "Parent App",     desc: "Track your child's progress",       icon: Heart,         accent: "from-rose-600 to-orange-600" },
  { key: "teacher",    title: "Teacher App",    desc: "Class, attendance & marks",         icon: Users,         accent: "from-emerald-600 to-teal-700" },
  { key: "admin",      title: "Admin App",      desc: "Full command center",               icon: Shield,        accent: "from-slate-800 to-black" },
  { key: "accountant", title: "Accounts App",   desc: "Fees, invoices & reports",          icon: Wallet,        accent: "from-amber-600 to-yellow-700" },
  { key: "library",    title: "Library App",    desc: "Books, issues & members",           icon: BookOpen,      accent: "from-purple-700 to-fuchsia-700" },
];

const InstallPortals = () => (
  <MainLayout>
    <Helmet><title>Install Portal Apps | Milestone College</title></Helmet>
    <section className="py-12 sm:py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10">
          <img src={schoolLogo} alt="MIC" className="w-16 h-16 object-contain mx-auto mb-3" />
          <h1 className="font-display text-3xl sm:text-4xl text-foreground">Install Portal Apps</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Each portal installs as its own separate app icon on your home screen — with its own colour and name.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {PORTALS.map((p) => {
            const Icon = p.icon;
            return (
              <Link key={p.key} to={`/install/${p.key}`}>
                <Card className={`group relative overflow-hidden p-5 border-border/60 hover:shadow-xl hover:-translate-y-0.5 transition-all`}>
                  <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${p.accent} opacity-10 group-hover:opacity-20 transition`} />
                  <div className="flex items-start gap-4 relative">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.accent} flex items-center justify-center text-white shadow-lg shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{p.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  </MainLayout>
);

export default InstallPortals;
