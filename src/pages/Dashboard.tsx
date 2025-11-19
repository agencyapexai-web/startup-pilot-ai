import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Lightbulb, 
  Code, 
  Target, 
  TrendingUp, 
  Palette, 
  DollarSign, 
  Settings,
  MessageSquare,
  FileText,
  CheckCircle2,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const mentorConfig = {
  strategist: { 
    icon: Lightbulb, 
    name: "Startup Strategist", 
    description: "Business model & strategy",
    color: "from-blue-500 to-cyan-500" 
  },
  tech: { 
    icon: Code, 
    name: "MVP Tech Mentor", 
    description: "Technical architecture",
    color: "from-purple-500 to-pink-500" 
  },
  validation: { 
    icon: Target, 
    name: "Market Validation", 
    description: "Customer research",
    color: "from-green-500 to-emerald-500" 
  },
  growth: { 
    icon: TrendingUp, 
    name: "Growth Mentor", 
    description: "Acquisition & scaling",
    color: "from-orange-500 to-red-500" 
  },
  branding: { 
    icon: Palette, 
    name: "Branding Expert", 
    description: "Positioning & messaging",
    color: "from-pink-500 to-rose-500" 
  },
  fundraising: { 
    icon: DollarSign, 
    name: "Fundraising Mentor", 
    description: "Investment & capital",
    color: "from-yellow-500 to-orange-500" 
  },
  operations: { 
    icon: Settings, 
    name: "Operations Mentor", 
    description: "Systems & processes",
    color: "from-indigo-500 to-blue-500" 
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, []);

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
    } catch (error) {
      console.error("Error loading project:", error);
      toast({
        title: "Error",
        description: "Failed to load project",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMentorClick = (mentorId: string) => {
    navigate(`/chat?mentor=${mentorId}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">No project found</h2>
          <p className="text-muted-foreground mb-6">Create your first project to get started</p>
          <Button onClick={() => navigate("/onboarding")}>Create Project</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-lg mb-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AI Startup Builder
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">Your personal startup incubator with 7 expert AI mentors</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={handleLogout} className="hover:bg-accent">
                Logout
              </Button>
            </div>
          </div>

          {/* Project Info */}
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{project.idea || "Your Startup"}</h2>
            <Badge variant="secondary" className="capitalize text-sm px-3 py-1">{project.stage}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">{project.industry}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-card/80">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Progress</p>
                <p className="text-3xl font-bold">15%</p>
              </div>
              <Clock className="w-10 h-10 text-primary opacity-50" />
            </div>
            <Progress value={15} className="mt-3 h-2" />
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-card/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tasks Done</p>
                <p className="text-3xl font-bold">3 / 20</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-card/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Conversations</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <MessageSquare className="w-10 h-10 text-primary opacity-50" />
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-card to-card/80">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Deliverables</p>
                <p className="text-3xl font-bold">0</p>
              </div>
              <FileText className="w-10 h-10 text-primary opacity-50" />
            </div>
          </Card>
        </div>

        {/* Mentors Grid */}
        <div>
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-3">Meet Your Mentor Team</h2>
            <p className="text-muted-foreground text-lg">Select a mentor to start building your startup with personalized guidance</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Object.entries(mentorConfig).map(([id, mentor]) => {
              const Icon = mentor.icon;
              return (
                <Card 
                  key={id}
                  className="group relative overflow-hidden hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 cursor-pointer hover:-translate-y-2 border-2 hover:border-primary/60 bg-gradient-to-br from-card to-card/80"
                  onClick={() => handleMentorClick(id)}
                >
                  <div className="p-6 relative z-10">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${mentor.color} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-2xl`}>
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors">
                      {mentor.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{mentor.description}</p>
                    <Button variant="ghost" size="sm" className="w-full group-hover:bg-primary/10">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Start Chat
                    </Button>
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-br ${mentor.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;