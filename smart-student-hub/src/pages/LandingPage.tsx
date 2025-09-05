import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  GraduationCap, 
  Trophy, 
  Users, 
  BarChart3, 
  Shield, 
  Zap,
  Star,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">Smart Student Hub</span>
          </div>
          <div className="space-x-2">
            <Button variant="ghost" asChild className="text-black bg-white/100 hover:bg-white/80">
              <Link to="/login">Login</Link>
            </Button>
            <Button variant="secondary" asChild className="text-black bg-white/100 hover:bg-white/80">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center text-white">
        <div className="container mx-auto px-4">
          <Badge className="mb-6 bg-white/10 text-white border-white/20">
            <Star className="h-4 w-4 mr-1" />
            AI-Powered Student Management
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Transform Your
            <br />
            <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
              Academic Journey
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white/80 max-w-3xl mx-auto">
            Complete student activity management with AI recommendations, 
            blockchain verification, and automated portfolio generation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 text-black bg-white/100 hover:bg-white/80">
              <Link to="/register">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 text-black border-white/30 hover:bg-white/10">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need to succeed</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From activity tracking to AI-powered recommendations, we've got every aspect of student life covered.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Trophy,
                title: "Activity Tracking",
                description: "Upload and verify achievements, competitions, certifications with blockchain security"
              },
              {
                icon: Users,
                title: "Faculty Management",
                description: "Streamlined approval workflows and comprehensive student performance analytics"
              },
              {
                icon: BarChart3,
                title: "Smart Analytics",
                description: "NAAC/NIRF ready reports with department-wise insights and trends"
              },
              {
                icon: Shield,
                title: "Blockchain Verified",
                description: "Tamper-proof certificate verification and secure activity records"
              },
              {
                icon: Zap,
                title: "AI Recommendations",
                description: "Personalized course suggestions and career pathway guidance"
              },
              {
                icon: GraduationCap,
                title: "Auto Portfolio",
                description: "Generate professional portfolios instantly for placements and applications"
              }
            ].map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-primary mb-4" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { number: "50K+", label: "Students Registered" },
              { number: "95%", label: "Approval Rate" },
              { number: "1000+", label: "Universities" },
              { number: "24/7", label: "Support Available" }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students and institutions already using Smart Student Hub
          </p>
          <Button size="lg" asChild className="text-lg px-8">
            <Link to="/register">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Smart Student Hub</span>
          </div>
          <p className="text-muted-foreground">
            Empowering students and institutions with intelligent activity management
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;