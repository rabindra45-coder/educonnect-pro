import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, School, Hash, Calendar } from "lucide-react";

const ChildrenList = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchChildren();
  }, [user]);

  const fetchChildren = async () => {
    try {
      const { data: parentData } = await supabase
        .from("parents")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (!parentData) { setIsLoading(false); return; }

      const { data: links } = await supabase
        .from("parent_students")
        .select("student_id, relationship")
        .eq("parent_id", parentData.id);

      const studentIds = links?.map((l) => l.student_id) || [];
      if (studentIds.length === 0) { setIsLoading(false); return; }

      const { data: students } = await supabase
        .from("students")
        .select("*")
        .in("id", studentIds);

      setChildren(
        (students || []).map((s) => ({
          ...s,
          relationship: links?.find((l) => l.student_id === s.id)?.relationship || "guardian",
        }))
      );
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Children</h1>
        <p className="text-muted-foreground">View and manage your children's profiles</p>
      </div>

      {children.length === 0 ? (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Children Linked</h3>
            <p className="text-muted-foreground">Contact school administration to link your children.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child) => {
            const initials = child.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
            return (
              <Card key={child.id} className="overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-teal-500 to-emerald-500" />
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-16 w-16 border-2 border-teal-200">
                      <AvatarFallback className="bg-teal-100 text-teal-700 font-bold text-lg">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">{child.full_name}</h3>
                      <Badge variant="outline" className="mt-1 capitalize">{child.relationship}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <School className="w-4 h-4 text-teal-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Class</p>
                        <p className="font-semibold text-sm">{child.class}{child.section ? ` - ${child.section}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Hash className="w-4 h-4 text-teal-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Roll No</p>
                        <p className="font-semibold text-sm">{child.roll_number || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="w-4 h-4 text-teal-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">DOB</p>
                        <p className="font-semibold text-sm">{child.date_of_birth || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Users className="w-4 h-4 text-teal-600" />
                      <div>
                        <p className="text-xs text-muted-foreground">Reg. No</p>
                        <p className="font-semibold text-sm">{child.registration_number || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChildrenList;
