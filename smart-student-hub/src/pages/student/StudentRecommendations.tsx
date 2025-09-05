import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lightbulb, Star, TrendingUp, Target, BookOpen, Award, ExternalLink, Bookmark } from "lucide-react";

const StudentRecommendations = () => {
  const skillGaps = [
    { skill: "React Native", current: 40, target: 80, priority: "high" },
    { skill: "Cloud Computing", current: 60, target: 85, priority: "medium" },
    { skill: "Data Structures", current: 70, target: 90, priority: "high" },
    { skill: "System Design", current: 30, target: 75, priority: "medium" }
  ];

  const courseRecommendations = [
    {
      title: "Advanced React Development",
      provider: "Tech Academy",
      duration: "6 weeks",
      difficulty: "Intermediate",
      rating: 4.8,
      relevance: 95,
      description: "Master advanced React concepts including hooks, context, and performance optimization"
    },
    {
      title: "AWS Cloud Practitioner",
      provider: "Amazon",
      duration: "4 weeks",
      difficulty: "Beginner",
      rating: 4.9,
      relevance: 88,
      description: "Learn cloud fundamentals and prepare for AWS certification"
    },
    {
      title: "Machine Learning Fundamentals",
      provider: "ML Institute",
      duration: "8 weeks",
      difficulty: "Intermediate",
      rating: 4.7,
      relevance: 82,
      description: "Introduction to ML algorithms and practical applications"
    }
  ];

  const opportunityRecommendations = [
    {
      title: "Google Summer of Code 2024",
      type: "Open Source",
      deadline: "2024-04-02",
      match: 92,
      description: "Contribute to open source projects with mentorship from industry experts"
    },
    {
      title: "Microsoft Student Ambassador",
      type: "Leadership",
      deadline: "2024-03-30",
      match: 87,
      description: "Lead tech communities and represent Microsoft on campus"
    },
    {
      title: "IEEE Research Competition",
      type: "Research",
      deadline: "2024-04-15",
      match: 79,
      description: "Submit your research paper in emerging technologies"
    }
  ];

  const careerPathways = [
    {
      title: "Full Stack Developer",
      match: 89,
      nextSteps: ["Master Node.js", "Learn DevOps", "Build portfolio projects"],
      timeframe: "6-8 months"
    },
    {
      title: "Data Scientist",
      match: 76,
      nextSteps: ["Learn Python/R", "Study Statistics", "Complete ML projects"],
      timeframe: "8-12 months"
    },
    {
      title: "Product Manager",
      match: 68,
      nextSteps: ["Business courses", "Leadership experience", "Product case studies"],
      timeframe: "12-18 months"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive";
      case "medium": return "text-warning";
      case "low": return "text-success";
      default: return "text-muted-foreground";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">AI Recommendations</h1>
            <p className="text-muted-foreground">Personalized suggestions to accelerate your growth</p>
          </div>
          <Button>
            <Target className="mr-2 h-4 w-4" />
            Set Goals
          </Button>
        </div>

        {/* Skill Gap Analysis */}
        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Skill Gap Analysis
            </CardTitle>
            <CardDescription>Areas where you can improve based on your career goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillGaps.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{skill.skill}</span>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(skill.priority)}>
                        {skill.priority} priority
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {skill.current}% → {skill.target}%
                      </span>
                    </div>
                  </div>
                  <Progress value={skill.current} className="h-3" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Course Recommendations */}
          <div className="space-y-6">
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Recommended Courses
                </CardTitle>
                <CardDescription>Curated courses based on your profile and goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {courseRecommendations.map((course, index) => (
                  <div key={index} className="p-4 rounded-lg bg-white/50 border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{course.title}</h4>
                      <Badge className="bg-primary-light text-primary">
                        {course.relevance}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span>{course.provider}</span>
                        <span>{course.duration}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{course.rating}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Career Pathways */}
            <Card className="bg-gradient-success text-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Career Pathways
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {careerPathways.map((pathway, index) => (
                  <div key={index} className="p-4 rounded-lg bg-white/10 border border-white/20">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold">{pathway.title}</h4>
                      <Badge className="bg-white/20 text-white">
                        {pathway.match}% match
                      </Badge>
                    </div>
                    <div className="text-sm text-white/80 mb-2">
                      Timeline: {pathway.timeframe}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Next steps:</span>
                      <ul className="mt-1 space-y-1">
                        {pathway.nextSteps.map((step, i) => (
                          <li key={i} className="flex items-center">
                            <span className="w-1 h-1 bg-white rounded-full mr-2"></span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Opportunities */}
          <div className="space-y-6">
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Opportunity Recommendations
                </CardTitle>
                <CardDescription>Competitions, programs, and opportunities for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {opportunityRecommendations.map((opportunity, index) => (
                  <div key={index} className="p-4 rounded-lg bg-white/50 border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{opportunity.title}</h4>
                      <Badge className="bg-secondary-light text-secondary">
                        {opportunity.match}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{opportunity.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">{opportunity.type}</Badge>
                        <span className="text-muted-foreground">Deadline: {opportunity.deadline}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button size="sm">Apply</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="bg-gradient-primary text-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 rounded-lg bg-white/10">
                  <p className="font-medium mb-1">🎯 Focus Area</p>
                  <p>Based on your profile, focus on strengthening your React skills and gaining cloud experience.</p>
                </div>
                <div className="p-3 rounded-lg bg-white/10">
                  <p className="font-medium mb-1">📈 Growth Trend</p>
                  <p>You're on track to become a full-stack developer. Consider adding DevOps skills.</p>
                </div>
                <div className="p-3 rounded-lg bg-white/10">
                  <p className="font-medium mb-1">🏆 Quick Win</p>
                  <p>Complete the AWS certification - it's highly valued by employers in your field.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentRecommendations;