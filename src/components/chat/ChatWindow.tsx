import { useState, useRef, useEffect } from "react";
import { Send, Share2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/hooks/useChatbot";

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (input: string) => Promise<void>;
  shareWithAdmin: (reason?: string) => Promise<boolean>;
  clearChat: () => void;
  conversationId: string | null;
}

const ChatWindow = ({
  messages,
  isLoading,
  sendMessage,
  shareWithAdmin,
  clearChat,
  conversationId,
}: ChatWindowProps) => {
  const [input, setInput] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareReason, setShareReason] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput("");
    await sendMessage(message);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    const success = await shareWithAdmin(shareReason);
    setIsSharing(false);
    if (success) {
      setShareDialogOpen(false);
      setShareReason("");
    }
  };

  return (
    <div className="flex flex-col h-[420px]">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm mb-2">👋 Welcome to SDSJSS!</p>
            <p className="text-xs">
              Ask me anything about admissions, academics, facilities, or events.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <span className="text-[10px] opacity-60 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Action Buttons */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t border-border flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs flex-1"
            onClick={() => setShareDialogOpen(true)}
            disabled={!conversationId}
          >
            <Share2 className="h-3 w-3 mr-1" />
            Share with Admin
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={clearChat}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Chat with Admin</DialogTitle>
            <DialogDescription>
              This will flag the conversation for admin review. You can optionally add a reason.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Why is this chat important? (optional)"
            value={shareReason}
            onChange={(e) => setShareReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShare} disabled={isSharing}>
              {isSharing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sharing...
                </>
              ) : (
                "Share with Admin"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatWindow;
