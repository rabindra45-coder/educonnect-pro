import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Mail, MailOpen, Reply, User, Clock, Send, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_type: string;
  recipient_type: string;
  subject: string | null;
  content: string;
  is_read: boolean;
  read_at: string | null;
  attachment_url: string | null;
  created_at: string;
  sender?: {
    full_name: string;
    photo_url: string | null;
  };
}

interface StudentMessagesCardProps {
  studentId: string;
  compact?: boolean;
  limit?: number;
  onViewAll?: () => void;
}

const StudentMessagesCard = ({ studentId, compact = false, limit, onViewAll }: StudentMessagesCardProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user, studentId]);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      // Get student record to find student id linked to user
      const { data: studentData } = await supabase
        .from("students")
        .select("id")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (!studentData) {
        setIsLoading(false);
        return;
      }

      // Fetch messages where recipient is this student
      let query = supabase
        .from("messages")
        .select("*")
        .or(`recipient_id.eq.${user?.id},recipient_id.eq.${studentData.id}`)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data: messagesData, error } = await query;

      if (error) throw error;

      // Fetch sender info for teacher messages
      const teacherIds = messagesData
        ?.filter((m: Message) => m.sender_type === "teacher")
        .map((m: Message) => m.sender_id) || [];

      let teachersMap: Record<string, any> = {};
      if (teacherIds.length > 0) {
        const { data: teachers } = await supabase
          .from("teachers")
          .select("user_id, full_name, photo_url")
          .in("user_id", teacherIds);

        teachersMap = (teachers || []).reduce((acc: any, t: any) => {
          acc[t.user_id] = t;
          return acc;
        }, {});
      }

      const messagesWithSender = (messagesData || []).map((msg: Message) => ({
        ...msg,
        sender: teachersMap[msg.sender_id] || null,
      }));

      setMessages(messagesWithSender);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await supabase
        .from("messages")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", messageId);

      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, is_read: true } : m))
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsViewDialogOpen(true);
    if (!message.is_read) {
      markAsRead(message.id);
    }
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter your reply",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user?.id,
        sender_type: "student",
        recipient_id: selectedMessage.sender_id,
        recipient_type: selectedMessage.sender_type,
        subject: `Re: ${selectedMessage.subject || "No Subject"}`,
        content: replyContent,
        parent_message_id: selectedMessage.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Reply sent successfully!",
      });

      setIsReplyDialogOpen(false);
      setReplyContent("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <MessageSquare className="w-4 h-4 text-blue-600" />
              </div>
              Messages from Teachers
            </CardTitle>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount} New
                </Badge>
              )}
              {compact && onViewAll && (
                <Button variant="ghost" size="sm" onClick={onViewAll}>
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No messages yet</p>
              <p className="text-sm">Messages from your teachers will appear here</p>
            </div>
          ) : (
            <ScrollArea className={compact ? "h-[200px]" : "h-[400px]"}>
              <div className="space-y-2">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleViewMessage(message)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      !message.is_read
                        ? "border-primary/50 bg-primary/5"
                        : "bg-card hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={message.sender?.photo_url || ""} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-sm truncate">
                            {message.sender?.full_name || "Teacher"}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                            {!message.is_read ? (
                              <Mail className="w-3 h-3 text-primary" />
                            ) : (
                              <MailOpen className="w-3 h-3" />
                            )}
                            {formatDate(message.created_at)}
                          </div>
                        </div>
                        {message.subject && (
                          <p className={`text-sm ${!message.is_read ? "font-medium" : ""} truncate`}>
                            {message.subject}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* View Message Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              {selectedMessage?.subject || "Message"}
            </DialogTitle>
            <DialogDescription>
              From: {selectedMessage?.sender?.full_name || "Teacher"} •{" "}
              {selectedMessage && formatDate(selectedMessage.created_at)}
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="whitespace-pre-wrap">{selectedMessage?.content}</p>
            </div>
            {selectedMessage?.attachment_url && (
              <Button
                variant="outline"
                onClick={() => window.open(selectedMessage.attachment_url!, "_blank")}
              >
                View Attachment
              </Button>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false);
                  setIsReplyDialogOpen(true);
                }}
              >
                <Reply className="w-4 h-4 mr-2" />
                Reply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
            <DialogDescription>
              Re: {selectedMessage?.subject || "No Subject"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium mb-1">Original message:</p>
              <p className="text-muted-foreground line-clamp-3">{selectedMessage?.content}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reply">Your Reply</Label>
              <Textarea
                id="reply"
                placeholder="Type your reply here..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReply} disabled={isSending}>
                <Send className="w-4 h-4 mr-2" />
                {isSending ? "Sending..." : "Send Reply"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudentMessagesCard;
