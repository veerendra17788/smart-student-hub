import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Share, Eye, Trophy, GraduationCap, Award } from "lucide-react";

const StudentPortfolio = () => {
  const portfolioData = {
    personalInfo: {
      name: "Alex Johnson",
      email: "alex@university.edu",
      phone: "+91 9876543210",
      department: "Computer Science & Engineering",
      rollNumber: "CS2024001",
      cgpa: "8.7"
    },
    activities: [
      {
        title: "Hackathon Winner - TechFest 2024",
        type: "Competition",
        date: "2024-03-15",
        credits: 15,
        description: "Won first place in 48-hour hackathon building an AI-powered healthcare app"
      },
      {
        title: "AWS Cloud Practitioner Certification",
        type: "Certification",
        date: "2024-03-10",
        credits: 10,
        description: "Completed comprehensive AWS cloud fundamentals certification"
      },
      {
        title: "Internship at Microsoft",
        type: "Internship",
        date: "2024-02-28",
        credits: 25,
        description: "3-month software development internship in Azure team"
      }
    ],
    skills: ["JavaScript", "React", "Python", "Machine Learning", "AWS", "Docker"],
    achievements: [
      "Dean's List - 3 consecutive semesters",
      "Best Student Project Award 2023",
      "Google Code-in Finalist"
    ]
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Portfolio</h1>
            <p className="text-muted-foreground">Generate and manage your professional portfolio</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button variant="outline">
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Template Selection */}
        <Card className="bg-gradient-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Portfolio Template</CardTitle>
            <CardDescription>Choose a template that fits your career goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <Select>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="placement">Placement Ready</SelectItem>
                    <SelectItem value="higher-studies">Higher Studies</SelectItem>
                    <SelectItem value="research">Research Focus</SelectItem>
                    <SelectItem value="entrepreneurship">Entrepreneurship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="w-full">
                Customize Layout
              </Button>
              <Button className="w-full">
                Generate Portfolio
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Portfolio Preview */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-0 shadow-xl">
              <CardHeader className="bg-gradient-primary text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">AJ</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{portfolioData.personalInfo.name}</CardTitle>
                    <CardDescription className="text-white/80">
                      {portfolioData.personalInfo.department}
                    </CardDescription>
                    <div className="flex space-x-4 mt-2 text-sm">
                      <span>{portfolioData.personalInfo.email}</span>
                      <span>{portfolioData.personalInfo.phone}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Academic Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Academic Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Roll Number:</span> {portfolioData.personalInfo.rollNumber}
                    </div>
                    <div>
                      <span className="font-medium">CGPA:</span> {portfolioData.personalInfo.cgpa}
                    </div>
                    <div>
                      <span className="font-medium">Department:</span> {portfolioData.personalInfo.department}
                    </div>
                    <div>
                      <span className="font-medium">Year:</span> 3rd Year
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Technical Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {portfolioData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>

                {/* Activities */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Trophy className="mr-2 h-5 w-5" />
                    Key Activities & Achievements
                  </h3>
                  <div className="space-y-3">
                    {portfolioData.activities.map((activity, index) => (
                      <div key={index} className="border-l-4 border-primary pl-4">
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                        <p className="text-sm">{activity.description}</p>
                        <Badge className="mt-1" variant="outline">{activity.credits} credits</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Award className="mr-2 h-5 w-5" />
                    Notable Achievements
                  </h3>
                  <ul className="space-y-1">
                    {portfolioData.achievements.map((achievement, index) => (
                      <li key={index} className="text-sm flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" className="w-full">
                  <Share className="mr-2 h-4 w-4" />
                  Get Shareable Link
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Export to LinkedIn
                </Button>
              </CardContent>
            </Card>

            {/* Portfolio Stats */}
            <Card className="bg-gradient-success text-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Portfolio Strength</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Completeness</span>
                    <span className="font-bold">85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Activities</span>
                    <span className="font-bold">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Credits</span>
                    <span className="font-bold">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Verifications</span>
                    <span className="font-bold">18/24</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suggestions */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle>AI Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>• Add more research projects to strengthen academic profile</p>
                  <p>• Include leadership experiences</p>
                  <p>• Add technical project descriptions</p>
                  <p>• Upload recommendation letters</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentPortfolio;