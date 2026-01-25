import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  AlertTriangle,
  Clock,
  CheckCircle,
  Archive,
  Eye,
  Trash2,
  Filter,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Conversation {
  id: string;
  visitor_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  is_important: boolean;
  importance_reason: string | null;
  is_auto_flagged: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

const ChatManagement = () => {
  const { hasAnyAdminRole } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "important" | "active" | "resolved">("important");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (hasAnyAdminRole()) {
      fetchConversations();
    }
  }, [filter]);

  const fetchConversations = async () => {
    setIsLoading(true);
    let query = supabase
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (filter === "important") {
      query = query.eq("is_important", true);
    } else if (filter === "active") {
      query = query.eq("status", "active");
    } else if (filter === "resolved") {
      query = query.eq("status", "resolved");
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } else {
      setConversations(data || []);
    }
    setIsLoading(false);
  };

  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data || []);
    }
  };

  const viewConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.id);
    setDialogOpen(true);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("chat_conversations")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Conversation marked as ${status}`);
      fetchConversations();
      if (selectedConversation?.id === id) {
        setSelectedConversation({ ...selectedConversation, status });
      }
    }
  };

  const deleteConversation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this conversation?")) return;

    const { error } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete conversation");
    } else {
      toast.success("Conversation deleted");
      setDialogOpen(false);
      fetchConversations();
    }
  };

  const importantCount = conversations.filter(c => c.is_important).length;
  const activeCount = conversations.filter(c => c.status === "active").length;

  if (!hasAnyAdminRole()) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Access denied</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Chat Management
            </h1>
            <p className="text-muted-foreground">
              View and manage visitor chat conversations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={(v: typeof filter) => setFilter(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="important">Important</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="all">All Chats</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-secondary" />
                Important Chats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{importantCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Active Chats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{activeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Total Chats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{conversations.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Conversations List */}
        <Card>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No conversations found
              </div>
            ) : (
              <div className="space-y-3">
                {conversations.map((conv) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {conv.visitor_name || conv.visitor_id.slice(0, 20)}
                        </span>
                        {conv.is_important && (
                          <Badge variant="destructive" className="text-xs">
                            {conv.is_auto_flagged ? "Auto-Flagged" : "Important"}
                          </Badge>
                        )}
                        <Badge
                          variant={conv.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {conv.status}
                        </Badge>
                      </div>
                      {conv.importance_reason && (
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.importance_reason}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(conv.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewConversation(conv)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {conv.status === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateStatus(conv.id, "resolved")}
                        >
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Conversation Details</span>
              {selectedConversation?.is_important && (
                <Badge variant="destructive">Important</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedConversation && (
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Conversation Info */}
              <div className="p-3 bg-muted rounded-lg mb-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Visitor:</span>{" "}
                    {selectedConversation.visitor_name || selectedConversation.visitor_id.slice(0, 20)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>{" "}
                    {selectedConversation.status}
                  </div>
                  {selectedConversation.importance_reason && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Reason:</span>{" "}
                      {selectedConversation.importance_reason}
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 border rounded-lg p-4">
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <span className="text-[10px] opacity-60 block mt-1">
                          {new Date(msg.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Actions */}
              <div className="flex justify-between mt-4 pt-4 border-t">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteConversation(selectedConversation.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  {selectedConversation.status === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(selectedConversation.id, "resolved")}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Resolved
                    </Button>
                  )}
                  {selectedConversation.status === "resolved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(selectedConversation.id, "archived")}
                    >
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ChatManagement;
