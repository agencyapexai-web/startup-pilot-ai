import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Lightbulb, 
  Code, 
  Target, 
  TrendingUp, 
  Palette, 
  DollarSign, 
  Settings,
  Send,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const mentorConfig = {
  strategist: { icon: Lightbulb, name: "Startup Strategist", color: "from-blue-500 to-cyan-500" },
  tech: { icon: Code, name: "MVP Tech Mentor", color: "from-purple-500 to-pink-500" },
  validation: { icon: Target, name: "Market Validation", color: "from-green-500 to-emerald-500" },
  growth: { icon: TrendingUp, name: "Growth Mentor", color: "from-orange-500 to-red-500" },
  branding: { icon: Palette, name: "Branding Expert", color: "from-pink-500 to-rose-500" },
  fundraising: { icon: DollarSign, name: "Fundraising Mentor", color: "from-yellow-500 to-orange-500" },
  operations: { icon: Settings, name: "Operations Mentor", color: "from-indigo-500 to-blue-500" }
};

const Chat = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const mentorId = searchParams.get("mentor") || "strategist";
  const scrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);

  const mentor = mentorConfig[mentorId as keyof typeof mentorConfig];
  const Icon = mentor?.icon || Lightbulb;

  useEffect(() => {
    loadProject();
  }, []);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      subscribeToMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadProject = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setProject(data);

      // Load or create conversation
      const { data: conv, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .eq("project_id", data.id)
        .eq("mentor_id", mentorId)
        .maybeSingle();

      if (conv) {
        setConversationId(conv.id);
      } else {
        // Create new conversation
        const { data: newConv, error: newError } = await supabase
          .from("conversations")
          .insert({
            project_id: data.id,
            mentor_id: mentorId,
            title: `${mentor.name} Chat`
          })
          .select()
          .single();

        if (newError) throw newError;
        setConversationId(newConv.id);
      }
    } catch (error) {
      console.error("Error loading project:", error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive"
      });
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !conversationId || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    try {
      // Save user message
      const { error: msgError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          role: "user",
          content: userMessage
        });

      if (msgError) throw msgError;

      // Call mentor edge function
      const { data, error } = await supabase.functions.invoke("mentor-chat", {
        body: {
          conversationId,
          mentorId,
          message: userMessage,
          projectContext: {
            idea: project?.idea,
            stage: project?.stage,
            industry: project?.industry
          }
        }
      });

      if (error) throw error;

      // Save AI response
      const { error: aiError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          role: "assistant",
          content: data.response
        });

      if (aiError) throw aiError;

    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-hero">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${mentor.color} flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">{mentor.name}</h1>
                <p className="text-sm text-muted-foreground">AI Mentor</p>
              </div>
            </div>
            <Badge variant="secondary">
              {messages.length} messages
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="container mx-auto px-4 py-6 space-y-4">
          {messages.length === 0 && !loading && (
            <Card className="p-8 text-center">
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${mentor.color} flex items-center justify-center mx-auto mb-4`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Start a conversation</h3>
              <p className="text-muted-foreground">
                Ask me anything about {mentor.name.toLowerCase()} for your startup!
              </p>
            </Card>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${mentor.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              )}
              <Card className={cn(
                "p-4 max-w-[80%]",
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
              )}>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </Card>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${mentor.color} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <Card className="p-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t bg-card shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${mentor.name}...`}
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;