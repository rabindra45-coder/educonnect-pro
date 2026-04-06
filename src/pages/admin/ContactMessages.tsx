import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Mail, MessageSquare, CheckCircle, Clock, Eye, Reply, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  admin_reply: string | null;
  created_at: string;
}

const ContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setMessages(data);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const filtered = messages.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.subject.toLowerCase().includes(searchQuery.toLowerCase()) || m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from("contact_messages").update({ status }).eq("id", id);
    if (!error) {
      toast.success(`Marked as ${status}`);
      fetchMessages();
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    setReplying(true);
    const { error } = await supabase.from("contact_messages").update({
      admin_reply: replyText.trim(),
      status: "replied",
      replied_at: new Date().toISOString(),
    }).eq("id", selectedMessage.id);
    if (!error) {
      toast.success("Reply saved");
      setSelectedMessage(null);
      setReplyText("");
      fetchMessages();
    }
    setReplying(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (!error) { toast.success("Deleted"); fetchMessages(); }
  };

  const statusColors: Record<string, string> = {
    new: "bg-primary/10 text-primary",
    read: "bg-muted text-muted-foreground",
    replied: "bg-accent/10 text-accent-foreground",
    resolved: "bg-secondary/20 text-secondary-foreground",
  };

  const newCount = messages.filter(m => m.status === "new").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Contact Messages</h2>
            <p className="text-muted-foreground text-sm">{newCount} new message{newCount !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search messages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Messages list */}
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center"><Mail className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No messages found.</p></CardContent></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((msg) => (
              <Card key={msg.id} className={`hover:shadow-md transition-shadow ${msg.status === "new" ? "border-primary/30 bg-primary/5" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground text-sm">{msg.name}</span>
                        <Badge variant="outline" className={`text-[10px] ${statusColors[msg.status] || ""}`}>{msg.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{msg.email} {msg.phone && `• ${msg.phone}`}</p>
                      <p className="text-sm font-medium text-foreground">{msg.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{msg.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{format(new Date(msg.created_at), "MMM d, yyyy h:mm a")}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {msg.status === "new" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStatusChange(msg.id, "read")} title="Mark as read"><Eye className="w-4 h-4" /></Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedMessage(msg); setReplyText(msg.admin_reply || ""); }} title="Reply"><Reply className="w-4 h-4" /></Button>
                      {msg.status !== "resolved" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStatusChange(msg.id, "resolved")} title="Resolve"><CheckCircle className="w-4 h-4" /></Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(msg.id)} title="Delete"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reply Dialog */}
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Reply to {selectedMessage?.name}</DialogTitle></DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">{selectedMessage.subject}</p>
                  <p className="text-sm text-muted-foreground">{selectedMessage.message}</p>
                </div>
                <Textarea placeholder="Type your reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={4} />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedMessage(null)}>Cancel</Button>
                  <Button onClick={handleReply} disabled={replying || !replyText.trim()}>
                    {replying ? "Saving..." : "Save Reply"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ContactMessages;
