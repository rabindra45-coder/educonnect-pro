import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import ResourceCenter from "@/components/resources/ResourceCenter";
import AIResourceStudio from "@/components/resources/AIResourceStudio";
import ResourceUploadDialog from "@/components/resources/ResourceUploadDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Upload, Download, FileBox, TrendingUp } from "lucide-react";
import { useResourceAnalytics } from "@/hooks/useResources";
import { useQueryClient } from "@tanstack/react-query";

const ResourcesManagement = () => {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { data: analytics } = useResourceAnalytics();
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["resources"] });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold">Resource Center</h1>
            <p className="text-sm text-muted-foreground">Upload, manage and generate learning materials.</p>
          </div>
          <Button onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-2" /> Upload
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat icon={FileBox} label="Total resources" value={analytics?.total ?? 0} />
          <Stat icon={Download} label="Total downloads" value={analytics?.downloadsCount ?? 0} />
          <Stat icon={TrendingUp} label="Most downloaded" value={analytics?.top?.[0]?.title ?? "—"} small />
          <Stat icon={FileBox} label="Recently added" value={analytics?.recent?.[0]?.title ?? "—"} small />
        </div>

        <Tabs defaultValue="browse">
          <TabsList>
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="ai">AI Studio</TabsTrigger>
          </TabsList>
          <TabsContent value="browse" className="pt-4">
            <ResourceCenter title="" subtitle="" />
          </TabsContent>
          <TabsContent value="ai" className="pt-4">
            <AIResourceStudio onCreated={refresh} />
          </TabsContent>
        </Tabs>

        <ResourceUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onSaved={refresh} />
      </div>
    </AdminLayout>
  );
};

const Stat = ({ icon: Icon, label, value, small }: any) => (
  <Card className="p-3">
    <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{label}</div>
    <div className={small ? "mt-1 text-sm font-medium truncate" : "mt-1 text-2xl font-display font-bold"}>{value}</div>
  </Card>
);

export default ResourcesManagement;
