import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Plus, Mail, MailOpen, Send } from "lucide-react";

const ParentMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const [formData, setFormData] = useState({
    recipient_id: "",
    subject: "",
    content: "",
  });

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchTeachers();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
        .order("created_at", { ascending: false })
        .limit(50);
      setMessages(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const { data } = await supabase.from("teachers").select("id, full_name, user_id, subject").eq("status", "active");
      setTeachers(data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const teacher = teachers.find((t) => t.id === formData.recipient_id);
      const { error } = await supabase.from("messages").insert({
        sender_id: user!.id,
        recipient_id: teacher?.user_id || formData.recipient_id,
        sender_type: "parent",
        recipient_type: "teacher",
        subject: formData.subject,
        content: formData.content,
      });
      if (error) throw error;
      setIsDialogOpen(false);
      setFormData({ recipient_id: "", subject: "", content: "" });
      fetchMessages();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyContent.trim()) return;
    setIsSending(true);
    try {
      const recipientId = selectedMessage.sender_id === user!.id ? selectedMessage.recipient_id : selectedMessage.sender_id;
      const { error } = await supabase.from("messages").insert({
        sender_id: user!.id,
        recipient_id: recipientId,
        sender_type: "parent",
        recipient_type: "teacher",
        subject: `Re: ${selectedMessage.subject || ""}`,
        content: replyContent,
        parent_message_id: selectedMessage.id,
      });
      if (error) throw error;
      setReplyContent("");
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const markAsRead = async (msgId: string) => {
    await supabase.from("messages").update({ is_read: true, read_at: new Date().toISOString() }).eq("id", msgId);
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-teal-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communicate with teachers securely</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Send New Message</DialogTitle></DialogHeader>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <Label>To (Teacher)</Label>
                <Select value={formData.recipient_id} onValueChange={(v) => setFormData({ ...formData, recipient_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.full_name} ({t.subject || "N/A"})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Message subject" required />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Write your message..." rows={4} required />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSending} className="bg-teal-600 hover:bg-teal-700">
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" />Send</>}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Message List */}
      <div className="space-y-2">
        {messages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No messages yet. Start a conversation with a teacher!</p>
            </CardContent>
          </Card>
        ) : (
          messages.map((msg) => {
            const isSent = msg.sender_id === user!.id;
            return (
              <Card
                key={msg.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${!msg.is_read && !isSent ? "border-teal-300 bg-teal-50/50 dark:bg-teal-950/20" : ""}`}
                onClick={() => {
                  setSelectedMessage(msg);
                  if (!msg.is_read && !isSent) markAsRead(msg.id);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {!msg.is_read && !isSent ? (
                        <Mail className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      ) : (
                        <MailOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{msg.subject || "(No Subject)"}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{msg.content}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className="text-xs">{isSent ? "Sent" : "Received"}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Reply Dialog */}
      {selectedMessage && (
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>{selectedMessage.subject || "(No Subject)"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{selectedMessage.content}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(selectedMessage.created_at).toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <Label>Reply</Label>
                <Textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Write your reply..." rows={3} />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleReply} disabled={isSending || !replyContent.trim()} className="bg-teal-600 hover:bg-teal-700">
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" />Reply</>}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ParentMessages;
