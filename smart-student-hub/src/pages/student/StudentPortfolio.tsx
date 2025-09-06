import React, { useState, useEffect } from 'react';
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, Download, Share, Eye, Trophy, GraduationCap, Award, 
  Settings, Palette, Layout, Save, RefreshCw, ExternalLink,
  Plus, Trash2, Edit3, CheckCircle, AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const StudentPortfolio = () => {
  const { toast } = useToast();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [previewUrl, setPreviewUrl] = useState('');
  
  // Mock user ID - in real app, get from auth context
  const userId = "user123";

  // API Functions
  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/portfolio/data/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPortfolioData(data);
        setSelectedTemplate(data.customization?.template || 'modern');
      } else {
        throw new Error('Failed to fetch portfolio data');
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to load portfolio data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePortfolio = async () => {
    try {
      setSaving(true);
      const response = await fetch(`http://localhost:5000/api/portfolio/update/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portfolioData)
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Portfolio saved successfully",
        });
      } else {
        throw new Error('Failed to save portfolio');
      }
    } catch (error) {
      console.error('Error saving portfolio:', error);
      toast({
        title: "Error",
        description: "Failed to save portfolio",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const generatePreview = async () => {
    try {
      const url = `http://localhost:5000/api/portfolio/generate/${userId}/${selectedTemplate}`;
      setPreviewUrl(url);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: "Error",
        description: "Failed to generate preview",
        variant: "destructive"
      });
    }
  };

  const downloadPDF = async () => {
    try {
      const url = `http://localhost:5000/api/portfolio/pdf/${userId}/${selectedTemplate}`;
      const link = document.createElement('a');
      link.href = url;
      link.download = `${portfolioData?.personalInfo?.name || 'Portfolio'}_Portfolio.pdf`;
      link.click();
      
      toast({
        title: "Success",
        description: "PDF download started",
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive"
      });
    }
  };

  const togglePublicSharing = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/portfolio/toggle-public/${userId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        setPortfolioData(prev => ({
          ...prev,
          settings: {
            ...prev?.settings,
            isPublic: data.isPublic,
            publicUrl: data.publicUrl
          }
        }));
        
        toast({
          title: "Success",
          description: data.isPublic ? "Portfolio is now public" : "Portfolio is now private",
        });
      } else {
        throw new Error('Failed to toggle sharing');
      }
    } catch (error) {
      console.error('Error toggling sharing:', error);
      toast({
        title: "Error",
        description: "Failed to update sharing settings",
        variant: "destructive"
      });
    }
  };

  const updatePersonalInfo = (field, value) => {
    setPortfolioData(prev => ({
      ...prev,
      personalInfo: {
        ...prev?.personalInfo,
        [field]: value
      }
    }));
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  if (loading || !portfolioData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading portfolio...</span>
        </div>
      </AppLayout>
    );
  }

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
            <Button variant="outline" onClick={generatePreview}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button variant="outline" onClick={togglePublicSharing}>
              <Share className="mr-2 h-4 w-4" />
              {portfolioData?.settings?.isPublic ? 'Make Private' : 'Share Public'}
            </Button>
            <Button onClick={downloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button onClick={savePortfolio} disabled={saving}>
              {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </div>
        </div>

        {/* Public URL Display */}
        {portfolioData?.settings?.isPublic && portfolioData?.settings?.publicUrl && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800 font-medium">Portfolio is public</span>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="bg-green-100 px-2 py-1 rounded text-sm">
                    /portfolio/{portfolioData.settings.publicUrl}
                  </code>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(`http://localhost:5000/api/portfolio/public/${portfolioData.settings.publicUrl}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="customization">Customization</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit3 className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={portfolioData?.personalInfo?.name || ''}
                      onChange={(e) => updatePersonalInfo('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={portfolioData?.personalInfo?.email || ''}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={portfolioData?.personalInfo?.phone || ''}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={portfolioData?.personalInfo?.department || ''}
                      onChange={(e) => updatePersonalInfo('department', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    value={portfolioData?.personalInfo?.bio || ''}
                    onChange={(e) => updatePersonalInfo('bio', e.target.value)}
                    placeholder="Write a brief professional summary..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Skills Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Technical Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(portfolioData?.skills?.technical || []).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customization" className="space-y-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Layout className="mr-2 h-5 w-5" />
                  Template Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {['modern', 'classic', 'creative'].map((template) => (
                    <div
                      key={template}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === template
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <h3 className="font-semibold capitalize">{template}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template === 'modern' && 'Clean, gradient-based design'}
                        {template === 'classic' && 'Traditional, professional layout'}
                        {template === 'creative' && 'Vibrant, animated design'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>
                  Preview how your portfolio will look with the selected template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="text-center py-8">
                    <Eye className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Click "Generate Preview" to see your portfolio</p>
                    <Button onClick={generatePreview}>
                      <Eye className="mr-2 h-4 w-4" />
                      Generate Preview
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Stats */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Activities</span>
                      <span className="font-bold">{portfolioData?.activities?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Technical Skills</span>
                      <span className="font-bold">{portfolioData?.skills?.technical?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Achievements</span>
                      <span className="font-bold">{portfolioData?.achievements?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Template</span>
                      <span className="font-bold capitalize">{selectedTemplate}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" onClick={downloadPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button variant="outline" className="w-full" onClick={generatePreview}>
                    <Eye className="mr-2 h-4 w-4" />
                    Open Preview
                  </Button>
                  <Button variant="outline" className="w-full" onClick={togglePublicSharing}>
                    <Share className="mr-2 h-4 w-4" />
                    {portfolioData?.settings?.isPublic ? 'Make Private' : 'Share Public'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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
                    {(portfolioData?.skills?.technical || []).map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
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
                    {(portfolioData?.activities || []).map((activity, index) => (
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
                    {(portfolioData?.achievements || []).map((achievement, index) => (
                      <li key={index} className="text-sm flex items-center">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        {typeof achievement === 'string' ? achievement : achievement.title}
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