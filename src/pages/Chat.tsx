import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Share2, Bot, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatWindow from "@/components/chat/ChatWindow";
import { useChatbot } from "@/hooks/useChatbot";

const Chat = () => {
  const chatbot = useChatbot();

  return (
    <>
      <Helmet>
        <title>Chat with Us | Shree Durga Saraswati Janata Secondary School</title>
        <meta
          name="description"
          content="Chat with our AI assistant to learn about admissions, academics, and more at SDSJSS."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Button variant="ghost" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <h1 className="font-display text-lg font-bold text-foreground">
                SDSJSS Chat
              </h1>
              <div className="w-24" />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                Chat with SDSJSS Assistant
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Get instant answers about admissions, academics, facilities, and events.
                Our AI assistant is here to help you 24/7.
              </p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid sm:grid-cols-3 gap-4 mb-8"
            >
              <div className="bg-card p-4 rounded-xl border border-border text-center">
                <Bot className="h-6 w-6 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">AI Powered</h3>
                <p className="text-xs text-muted-foreground">
                  Smart responses to all your questions
                </p>
              </div>
              <div className="bg-card p-4 rounded-xl border border-border text-center">
                <Share2 className="h-6 w-6 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">Share Important Chats</h3>
                <p className="text-xs text-muted-foreground">
                  Flag conversations for admin review
                </p>
              </div>
              <div className="bg-card p-4 rounded-xl border border-border text-center">
                <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                <h3 className="font-semibold text-sm mb-1">Private & Secure</h3>
                <p className="text-xs text-muted-foreground">
                  Your conversations are protected
                </p>
              </div>
            </motion.div>

            {/* Chat Window */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden"
            >
              {/* Chat Header */}
              <div className="flex items-center gap-3 p-4 bg-primary text-primary-foreground">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">SDSJSS Assistant</h3>
                  <p className="text-xs text-primary-foreground/70">
                    {chatbot.isLoading ? "Typing..." : "Online • Ready to help"}
                  </p>
                </div>
              </div>

              {/* Chat Content */}
              <div className="h-[500px]">
                <ChatWindow {...chatbot} />
              </div>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-4 bg-muted/50 rounded-xl"
            >
              <h4 className="font-semibold text-sm mb-2">💡 Tips for better conversations:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Ask about admission requirements, deadlines, and procedures</li>
                <li>• Inquire about academic programs and extracurricular activities</li>
                <li>• Get information about school facilities and timings</li>
                <li>• Use "Share with Admin" for urgent or complex queries</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
