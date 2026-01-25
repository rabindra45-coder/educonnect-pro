import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const ANALYZE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-chat-importance`;

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [visitorId, setVisitorId] = useState<string>("");

  // Generate or retrieve visitor ID
  useEffect(() => {
    let id = localStorage.getItem("chat_visitor_id");
    if (!id) {
      id = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("chat_visitor_id", id);
    }
    setVisitorId(id);
  }, []);

  const createConversation = async () => {
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ visitor_id: visitorId })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
    return data.id;
  };

  const saveMessage = async (convId: string, role: "user" | "assistant", content: string) => {
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      role,
      content,
    });
  };

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Create conversation if needed
    let convId = conversationId;
    if (!convId) {
      convId = await createConversation();
      if (convId) {
        setConversationId(convId);
      }
    }

    // Save user message
    if (convId) {
      await saveMessage(convId, "user", input);
    }

    let assistantContent = "";

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, {
          id: `assistant_${Date.now()}`,
          role: "assistant" as const,
          content: assistantContent,
          timestamp: new Date(),
        }];
      });
    };

    try {
      const messagesToSend = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: messagesToSend }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error("Failed to get response");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) updateAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save assistant message
      if (convId && assistantContent) {
        await saveMessage(convId, "assistant", assistantContent);
      }

      // Auto-analyze for importance after every few messages
      if (messages.length > 2 && messages.length % 4 === 0) {
        analyzeImportance();
      }

    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [messages, conversationId, visitorId]);

  const analyzeImportance = async () => {
    if (!conversationId || messages.length < 2) return;

    try {
      const resp = await fetch(ANALYZE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (resp.ok) {
        const result = await resp.json();
        if (result.isImportant) {
          await supabase
            .from("chat_conversations")
            .update({
              is_important: true,
              is_auto_flagged: true,
              importance_reason: result.reason,
            })
            .eq("id", conversationId);
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);
    }
  };

  const shareWithAdmin = async (reason?: string) => {
    if (!conversationId) {
      toast.error("No conversation to share");
      return false;
    }

    try {
      const { error } = await supabase
        .from("chat_conversations")
        .update({
          is_important: true,
          importance_reason: reason || "Manually shared by visitor",
        })
        .eq("id", conversationId);

      if (error) throw error;
      
      toast.success("Chat shared with admin successfully!");
      return true;
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share chat");
      return false;
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationId(null);
  };

  return {
    messages,
    isLoading,
    sendMessage,
    shareWithAdmin,
    clearChat,
    conversationId,
  };
}
