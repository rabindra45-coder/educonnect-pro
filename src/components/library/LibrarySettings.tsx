import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Loader2, Save } from "lucide-react";

interface LibrarySettingsData {
  id: string;
  fine_per_day: number;
  max_books_per_student: number;
  default_issue_days: number;
  lost_book_fine_multiplier: number;
}

const LibrarySettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<LibrarySettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("library_settings")
        .select("*")
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("library_settings")
        .update({
          fine_per_day: settings.fine_per_day,
          max_books_per_student: settings.max_books_per_student,
          default_issue_days: settings.default_issue_days,
          lost_book_fine_multiplier: settings.lost_book_fine_multiplier,
        })
        .eq("id", settings.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Library settings updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Library Settings
        </CardTitle>
        <CardDescription>Configure library policies and fine rates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="fine_per_day">Fine Per Day (रू)</Label>
            <Input
              id="fine_per_day"
              type="number"
              min={0}
              step={0.5}
              value={settings?.fine_per_day || 0}
              onChange={(e) =>
                setSettings((prev) =>
                  prev ? { ...prev, fine_per_day: parseFloat(e.target.value) } : null
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              Amount charged per day for late book returns
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_books">Max Books Per Student</Label>
            <Input
              id="max_books"
              type="number"
              min={1}
              value={settings?.max_books_per_student || 0}
              onChange={(e) =>
                setSettings((prev) =>
                  prev ? { ...prev, max_books_per_student: parseInt(e.target.value) } : null
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of books a student can borrow at once
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="issue_days">Default Issue Period (Days)</Label>
            <Input
              id="issue_days"
              type="number"
              min={1}
              value={settings?.default_issue_days || 0}
              onChange={(e) =>
                setSettings((prev) =>
                  prev ? { ...prev, default_issue_days: parseInt(e.target.value) } : null
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              Default number of days books can be borrowed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lost_multiplier">Lost Book Fine Multiplier</Label>
            <Input
              id="lost_multiplier"
              type="number"
              min={1}
              step={0.5}
              value={settings?.lost_book_fine_multiplier || 0}
              onChange={(e) =>
                setSettings((prev) =>
                  prev ? { ...prev, lost_book_fine_multiplier: parseFloat(e.target.value) } : null
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              Multiplier applied to book price for lost books
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LibrarySettings;
