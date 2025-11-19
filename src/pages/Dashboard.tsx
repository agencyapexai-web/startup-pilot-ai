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

const mentors = [
  {
    id: "strategist",
    icon: Lightbulb,
    name: "Startup Strategist",
    description: "Business model & strategy",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "tech",
    icon: Code,
    name: "MVP Tech Mentor",
    description: "Technical architecture",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "validation",
    icon: Target,
    name: "Market Validation",
    description: "Customer research",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "growth",
    icon: TrendingUp,
    name: "Growth Mentor",
    description: "Acquisition & scaling",
    color: "from-orange-500 to-red-500"
  },
  {
    id: "branding",
    icon: Palette,
    name: "Branding Expert",
    description: "Positioning & messaging",
    color: "from-pink-500 to-rose-500"
  },
  {
    id: "fundraising",
    icon: DollarSign,
    name: "Fundraising Mentor",
    description: "Investment & capital",
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: "operations",
    icon: Settings,
    name: "Operations Mentor",
    description: "Systems & processes",
    color: "from-indigo-500 to-blue-500"
  }
];

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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">{project.idea || "Your Startup"}</h1>
            <Badge variant="secondary" className="capitalize">{project.stage}</Badge>
          </div>
          <p className="text-muted-foreground">{project.industry}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">15%</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <Progress value={15} className="mt-2" />
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasks Done</p>
                <p className="text-2xl font-bold">3 / 20</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversations</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Deliverables</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* Mentors Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Talk to Your Mentors</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mentors.map((mentor) => {
              const Icon = mentor.icon;
              return (
                <Card 
                  key={mentor.id}
                  className="p-6 hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary"
                  onClick={() => handleMentorClick(mentor.id)}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mentor.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{mentor.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{mentor.description}</p>
                  <Button variant="ghost" size="sm" className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
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