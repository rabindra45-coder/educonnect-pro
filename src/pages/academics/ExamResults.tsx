import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { FileText, Download, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExamResult {
  id: string;
  title: string;
  academic_year: string;
  exam_type: string;
  class: string;
  result_url: string | null;
  created_at: string;
}

const ExamResults = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>("all");

  useEffect(() => {
    const fetchResults = async () => {
      const { data, error } = await supabase
        .from("exam_results")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setResults(data);
      }
      setLoading(false);
    };

    fetchResults();
  }, []);

  const years = ["all", ...new Set(results.map((r) => r.academic_year))];

  const filteredResults =
    selectedYear === "all"
      ? results
      : results.filter((r) => r.academic_year === selectedYear);

  return (
    <>
      <Helmet>
        <title>Exam Results | Shree Durga Saraswati Janata Secondary School</title>
        <meta
          name="description"
          content="View exam results and academic performance reports for students of Shree Durga Saraswati Janata Secondary School."
        />
      </Helmet>

      <MainLayout>
        {/* Hero Section */}
        <section className="relative py-24 bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                Exam Results
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Access examination results and academic performance reports.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Results Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            {/* Year Filter */}
            {results.length > 0 && (
              <motion.div
                className="flex flex-wrap justify-center gap-3 mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${
                      selectedYear === year
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-primary/10"
                    }`}
                  >
                    {year === "all" ? "All Years" : year}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Results Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-48 rounded-xl bg-muted animate-pulse"></div>
                ))}
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Results Available
                </h3>
                <p className="text-muted-foreground">
                  Exam results will be published here when available.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-card-hover transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-primary font-medium mb-1">
                              {result.exam_type}
                            </p>
                            <CardTitle className="text-lg">{result.title}</CardTitle>
                          </div>
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{result.academic_year}</span>
                          </div>
                          <div>Class: {result.class}</div>
                        </div>
                        {result.result_url && (
                          <Button variant="outline" size="sm" className="w-full" asChild>
                            <a href={result.result_url} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-2" />
                              View Results
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </MainLayout>
    </>
  );
};

export default ExamResults;
