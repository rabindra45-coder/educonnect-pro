-- Create table for storing chat conversations
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  visitor_name text,
  visitor_email text,
  is_important boolean DEFAULT false,
  importance_reason text,
  is_auto_flagged boolean DEFAULT false,
  status text DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create table for storing chat messages
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  is_flagged boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_conversations
-- Anyone can create conversations (visitors)
CREATE POLICY "Anyone can create conversations"
ON public.chat_conversations FOR INSERT
WITH CHECK (true);

-- Anyone can view their own conversations by visitor_id
CREATE POLICY "Visitors can view their own conversations"
ON public.chat_conversations FOR SELECT
USING (true);

-- Anyone can update their own conversations
CREATE POLICY "Visitors can update their own conversations"
ON public.chat_conversations FOR UPDATE
USING (true);

-- Admins can manage all conversations
CREATE POLICY "Admins can manage all conversations"
ON public.chat_conversations FOR ALL
USING (has_any_admin_role(auth.uid()));

-- RLS Policies for chat_messages
-- Anyone can insert messages
CREATE POLICY "Anyone can insert messages"
ON public.chat_messages FOR INSERT
WITH CHECK (true);

-- Anyone can view messages
CREATE POLICY "Anyone can view messages"
ON public.chat_messages FOR SELECT
USING (true);

-- Admins can manage all messages
CREATE POLICY "Admins can manage all messages"
ON public.chat_messages FOR ALL
USING (has_any_admin_role(auth.uid()));

-- Add updated_at trigger
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;