import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const stages = ["idea", "validation", "mvp", "traction"] as const;
const industries = [
  "SaaS",
  "E-commerce",
  "FinTech",
  "HealthTech",
  "EdTech",
  "MarketPlace",
  "AI/ML",
  "Other"
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    ideaDescription: "",
    stage: "idea" as typeof stages[number],
    industry: "",
    targetCustomer: "",
    teamSize: "solo",
    techKnowledge: "beginner",
    tractionMetrics: ""
  });

  const progress = (step / 3) * 100;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to continue",
          variant: "destructive"
        });
        navigate("/auth");
        return;
      }

      const { error } = await supabase.from("projects").insert({
        user_id: user.id,
        idea: formData.ideaDescription,
        stage: formData.stage,
        industry: formData.industry,
        target_customer: formData.targetCustomer,
        team_size: formData.teamSize,
        tech_knowledge: formData.techKnowledge,
        traction_metrics: formData.tractionMetrics
      });

      if (error) throw error;

      toast({
        title: "Project created!",
        description: "Let's start building your startup",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Tell us about your startup</h2>
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Core Idea */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <Label htmlFor="idea">What's your startup idea?</Label>
              <Textarea
                id="idea"
                placeholder="Describe your idea in a few sentences..."
                value={formData.ideaDescription}
                onChange={(e) => setFormData({ ...formData, ideaDescription: e.target.value })}
                className="min-h-[120px] mt-2"
              />
            </div>

            <div>
              <Label htmlFor="stage">Current stage</Label>
              <Select
                value={formData.stage}
                onValueChange={(value) => setFormData({ ...formData, stage: value as typeof stages[number] })}
              >
                <SelectTrigger id="stage" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">Just an idea</SelectItem>
                  <SelectItem value="validation">Validating the idea</SelectItem>
                  <SelectItem value="mvp">Building MVP</SelectItem>
                  <SelectItem value="traction">Have some traction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => setFormData({ ...formData, industry: value })}
              >
                <SelectTrigger id="industry" className="mt-2">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 2: Target Market */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <Label htmlFor="customer">Who is your target customer?</Label>
              <Textarea
                id="customer"
                placeholder="e.g., Small business owners, B2B SaaS companies, students..."
                value={formData.targetCustomer}
                onChange={(e) => setFormData({ ...formData, targetCustomer: e.target.value })}
                className="min-h-[100px] mt-2"
              />
            </div>

            <div>
              <Label htmlFor="traction">Current traction (if any)</Label>
              <Input
                id="traction"
                placeholder="e.g., 100 signups, $5K MRR, 500 waitlist..."
                value={formData.tractionMetrics}
                onChange={(e) => setFormData({ ...formData, tractionMetrics: e.target.value })}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">Leave blank if you haven't launched yet</p>
            </div>
          </div>
        )}

        {/* Step 3: Team & Skills */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <Label>Team size</Label>
              <RadioGroup
                value={formData.teamSize}
                onValueChange={(value) => setFormData({ ...formData, teamSize: value })}
                className="mt-2 space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="solo" id="solo" />
                  <Label htmlFor="solo" className="font-normal cursor-pointer">Solo founder</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2-3" id="small" />
                  <Label htmlFor="small" className="font-normal cursor-pointer">2-3 people</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="4+" id="team" />
                  <Label htmlFor="team" className="font-normal cursor-pointer">4+ people</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Technical knowledge</Label>
              <RadioGroup
                value={formData.techKnowledge}
                onValueChange={(value) => setFormData({ ...formData, techKnowledge: value })}
                className="mt-2 space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner" className="font-normal cursor-pointer">Beginner (no code background)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate" className="font-normal cursor-pointer">Intermediate (some coding)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced" className="font-normal cursor-pointer">Advanced (full-stack dev)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => navigate("/")}>
              Cancel
            </Button>
          )}

          {step < 3 ? (
            <Button onClick={handleNext} disabled={!formData.ideaDescription && step === 1}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="bg-gradient-accent"
            >
              {loading ? "Creating..." : "Start Building"}
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;