import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Lightbulb, 
  Code, 
  Target, 
  TrendingUp, 
  Palette, 
  DollarSign, 
  Settings,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

const mentors = [
  {
    icon: Lightbulb,
    name: "Startup Strategist",
    description: "Transform ideas into validated business models",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Code,
    name: "MVP Tech Mentor",
    description: "Build products fast with the right stack",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Target,
    name: "Market Validation",
    description: "Validate demand before you build",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: TrendingUp,
    name: "Growth Mentor",
    description: "Scale from 0 to product-market fit",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Palette,
    name: "Branding Expert",
    description: "Position yourself to stand out",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: DollarSign,
    name: "Fundraising Mentor",
    description: "Raise capital with confidence",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Settings,
    name: "Operations Mentor",
    description: "Build systems that scale",
    color: "from-indigo-500 to-blue-500"
  }
];

const features = [
  "30-day personalized roadmap",
  "Automated deliverables (PRDs, pitch decks, emails)",
  "Step-by-step task breakdown",
  "Growth experiments engine",
  "Template library",
  "Progress tracking dashboard"
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by Gemini AI
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Your AI Startup
            <span className="block bg-gradient-accent bg-clip-text text-transparent">
              Incubator
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Build, launch, and scale your startup with 7 specialized AI mentors. 
            From idea validation to fundraising—all in one platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              className="bg-gradient-accent hover:shadow-accent transition-all text-lg px-8 py-6"
              onClick={() => navigate("/onboarding")}
            >
              Start Building
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-16">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mentors Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Meet Your AI Mentors
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each mentor specializes in a critical aspect of building a successful startup.
            Get expert guidance at every stage of your journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {mentors.map((mentor) => {
            const Icon = mentor.icon;
            return (
              <Card 
                key={mentor.name} 
                className="p-6 hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-primary"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mentor.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{mentor.name}</h3>
                <p className="text-sm text-muted-foreground">{mentor.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-primary text-white p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Build Your Startup?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join founders who are building with AI-powered guidance. 
            No experience required—just bring your idea.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-6"
            onClick={() => navigate("/onboarding")}
          >
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Landing;