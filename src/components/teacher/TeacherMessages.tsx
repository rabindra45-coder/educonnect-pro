import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Plus, 
  Loader2, 
  Send,
  Users,
  Bell,
  Inbox,
  Mail,
} from "lucide-react";
import { format } from "date-fns";

interface TeacherMessagesProps {
  teacherId: string | undefined;
}

interface Message {
  id: string;
  subject: string | null;
  content: string;
  sender_id: string;
  recipient_id: string;
  sender_type: string;
  recipient_type: string;
  is_read: boolean;
  created_at: string;
}

interface Student {
  id: string;
  full_name: string;
  class: string;
  section: string | null;
  photo_url: string | null;
  user_id: string | null;
}

const TeacherMessages = ({ teacherId }: TeacherMessagesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedRecipient, setSelectedRecipient] = useState<Student | null>(null);
  
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    recipient_id: "",
  });

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchStudents();
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!teacherId) return;

    try {
      const { data: assignments } = await supabase
        .from("teacher_assignments")
        .select("class")
        .eq("teacher_id", teacherId);

      const classes = [...new Set(assignments?.map((a) => a.class) || [])];

      if (classes.length === 0) {
        setStudents([]);
        return;
      }

      const { data, error } = await supabase
        .from("students")
        .select("id, full_name, class, section, photo_url, user_id")
        .in("class", classes)
        .eq("status", "active")
        .order("full_name");

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !formData.content || !selectedRecipient?.user_id) {
      toast({
        title: "Error",
        description: "Please select a recipient and enter a message.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: selectedRecipient.user_id,
        sender_type: "teacher",
        recipient_type: "student",
        subject: formData.subject || null,
        content: formData.content,
      });

      if (error) throw error;

      toast({
        title: "Message Sent",
        description: `Message sent to ${selectedRecipient.full_name}`,
      });

      setShowComposeDialog(false);
      setFormData({ subject: "", content: "", recipient_id: "" });
      setSelectedRecipient(null);
      fetchMessages();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const inboxMessages = messages.filter((m) => m.recipient_id === user?.id);
  const sentMessages = messages.filter((m) => m.sender_id === user?.id);
  const unreadCount = inboxMessages.filter((m) => !m.is_read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messages
              {unreadCount > 0 && (
                <Badge className="bg-red-500">{unreadCount} new</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Communicate with students and parents
            </CardDescription>
          </div>
          <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Compose
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>To (Student)</Label>
                  <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
                    {students.filter((s) => s.user_id).map((student) => (
                      <div
                        key={student.id}
                        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                          selectedRecipient?.id === student.id
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedRecipient(student)}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={student.photo_url || ""} />
                          <AvatarFallback>{student.full_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{student.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            Class {student.class}{student.section ? `-${student.section}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedRecipient && (
                    <Badge className="mt-2">
                      To: {selectedRecipient.full_name}
                    </Badge>
                  )}
                </div>

                <div>
                  <Label>Subject</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Message subject (optional)"
                  />
                </div>

                <div>
                  <Label>Message *</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Type your message..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendMessage} disabled={!selectedRecipient || !formData.content}>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="inbox" className="flex items-center gap-1">
                <Inbox className="w-4 h-4" />
                Inbox ({inboxMessages.length})
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                Sent ({sentMessages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inbox">
              {inboxMessages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Inbox className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No messages in inbox</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {inboxMessages.map((message) => (
                    <Card key={message.id} className={!message.is_read ? "border-blue-500" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            {message.subject && (
                              <p className="font-semibold">{message.subject}</p>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {message.content}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(message.created_at), "MMM d, h:mm a")}
                            </p>
                            {!message.is_read && (
                              <Badge className="bg-blue-500 mt-1">New</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sent">
              {sentMessages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No sent messages</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sentMessages.map((message) => (
                    <Card key={message.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            {message.subject && (
                              <p className="font-semibold">{message.subject}</p>
                            )}
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {message.content}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(message.created_at), "MMM d, h:mm a")}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherMessages;
