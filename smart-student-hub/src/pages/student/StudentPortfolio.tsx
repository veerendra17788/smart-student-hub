import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AppLayout from '../../components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  Save, 
  Download, 
  Eye, 
  Share, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Award,
  BookOpen,
  Briefcase,
  Star,
  Filter,
  Search,
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Target,
  Zap,
  Sparkles,
  Edit3,
  Maximize2,
  Minimize2,
  Code,
  Trophy,
  AlertCircle,
  Layout,
  GraduationCap,
  FileText
} from 'lucide-react';

import { useToast } from "../../hooks/use-toast";

const StudentPortfolio = () => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [previewUrl, setPreviewUrl] = useState('');
  const [viewMode, setViewMode] = useState('dashboard'); // dashboard, editor, preview
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Get user ID from authenticated user (try rollNumber first, then id, then email)
  const userId = user?.rollNumber || user?.id || user?.email;

  // API Functions
  const fetchPortfolioData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/portfolio/data/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPortfolioData(data);
        setSelectedTemplate(data.customization?.template || 'modern');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch portfolio data');
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load portfolio data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePortfolio = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Please log in to save portfolio",
        variant: "destructive"
      });
      return;
    }
    
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
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save portfolio');
      }
    } catch (error) {
      console.error('Error saving portfolio:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save portfolio",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const generatePreview = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "Please log in to generate preview",
        variant: "destructive"
      });
      return;
    }

    try {
      // First save the current portfolio data
      await savePortfolio();
      
      // Test if the backend endpoint is available
      const testUrl = `http://localhost:5000/api/portfolio/generate/${userId}/${selectedTemplate}`;
      
      try {
        const response = await fetch(testUrl, { method: 'HEAD' });
        if (response.ok) {
          // Backend is available, use live preview
          setPreviewUrl(testUrl);
          toast({
            title: "Success",
            description: "Live portfolio preview generated successfully",
          });
        } else {
          throw new Error('Backend not available');
        }
      } catch (backendError) {
        // Backend not available, show static preview
        console.log('Backend not available, showing static preview');
        setPreviewUrl(''); // This will show the static preview
        toast({
          title: "Preview Ready",
          description: "Showing static portfolio preview",
        });
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      // Fallback to static preview
      setPreviewUrl('');
      toast({
        title: "Preview Ready",
        description: "Showing portfolio preview",
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

  // Education management functions
  const updateEducation = (index, field, value) => {
    setPortfolioData(prev => ({
      ...prev,
      education: prev?.education?.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      ) || []
    }));
  };

  const addEducation = () => {
    setPortfolioData(prev => ({
      ...prev,
      education: [
        ...(prev?.education || []),
        {
          institution: '',
          degree: '',
          field: '',
          grade: '',
          startYear: '',
          endYear: '',
          description: ''
        }
      ]
    }));
  };

  const removeEducation = (index) => {
    setPortfolioData(prev => ({
      ...prev,
      education: prev?.education?.filter((_, i) => i !== index) || []
    }));
  };

  // Projects management functions
  const updateProject = (index, field, value) => {
    setPortfolioData(prev => ({
      ...prev,
      projects: prev?.projects?.map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      ) || []
    }));
  };

  const addProject = () => {
    setPortfolioData(prev => ({
      ...prev,
      projects: [
        ...(prev?.projects || []),
        {
          title: '',
          description: '',
          technologies: [],
          startDate: '',
          endDate: '',
          githubUrl: '',
          liveUrl: '',
          status: 'completed'
        }
      ]
    }));
  };

  const removeProject = (index) => {
    setPortfolioData(prev => ({
      ...prev,
      projects: prev?.projects?.filter((_, i) => i !== index) || []
    }));
  };

  // Skills management functions
  const addSkill = (category, skill) => {
    if (!skill.trim()) return;
    setPortfolioData(prev => ({
      ...prev,
      skills: {
        ...prev?.skills,
        [category]: [...(prev?.skills?.[category] || []), skill.trim()]
      }
    }));
  };

  const removeSkill = (category, index) => {
    setPortfolioData(prev => ({
      ...prev,
      skills: {
        ...prev?.skills,
        [category]: prev?.skills?.[category]?.filter((_, i) => i !== index) || []
      }
    }));
  };

  // Enhanced portfolio metrics calculation
  const portfolioMetrics = useMemo(() => {
    if (!portfolioData) return { 
      completeness: 0, strength: 0, totalActivities: 0, verifiedActivities: 0, 
      recentActivities: 0, totalSkills: 0, educationScore: 0, projectsCount: 0 
    };

    const personalInfoScore = portfolioData.personalInfo ? 
      Object.values(portfolioData.personalInfo).filter(val => val && val !== '').length * 3 : 0;
    
    const activitiesScore = (portfolioData.activities?.length || 0) * 4;
    const skillsScore = ((portfolioData.skills?.technical?.length || 0) + (portfolioData.skills?.soft?.length || 0)) * 2;
    const educationScore = (portfolioData.education?.length || 0) * 8;
    const projectsScore = (portfolioData.projects?.length || 0) * 6;
    const certificatesScore = (portfolioData.certificates?.length || 0) * 5;
    
    const verifiedCount = portfolioData.activities?.filter(a => a.verified).length || 0;
    const recentCount = portfolioData.activities?.filter(a => 
      new Date(a.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length || 0;

    const totalScore = personalInfoScore + activitiesScore + skillsScore + educationScore + projectsScore + certificatesScore;
    const maxScore = 200;

    return {
      completeness: Math.min(Math.round((totalScore / maxScore) * 100), 100),
      strength: Math.min(Math.round(((verifiedCount * 8) + (activitiesScore * 0.4) + (educationScore * 0.3)) / 3), 100),
      totalActivities: portfolioData.activities?.length || 0,
      verifiedActivities: verifiedCount,
      recentActivities: recentCount,
      totalSkills: (portfolioData.skills?.technical?.length || 0) + (portfolioData.skills?.soft?.length || 0),
      educationScore: portfolioData.education?.length || 0,
      projectsCount: portfolioData.projects?.length || 0
    };
  }, [portfolioData]);

  // Filter activities based on search and type
  const filteredActivities = useMemo(() => {
    if (!portfolioData?.activities) return [];
    
    return portfolioData.activities.filter(activity => {
      const matchesSearch = !searchQuery || 
        activity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.organization?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = filterType === 'all' || activity.type === filterType;
      
      return matchesSearch && matchesFilter;
    });
  }, [portfolioData?.activities, searchQuery, filterType]);

  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchPortfolioData();
    }
  }, [isAuthenticated, userId]);

  // Auto-generate preview when template changes
  useEffect(() => {
    if (portfolioData && userId && selectedTemplate) {
      const autoGeneratePreview = async () => {
        try {
          const url = `http://localhost:5000/api/portfolio/generate/${userId}/${selectedTemplate}`;
          setPreviewUrl(url);
        } catch (error) {
          console.error('Error auto-generating preview:', error);
        }
      };
      autoGeneratePreview();
    }
  }, [selectedTemplate, portfolioData, userId]);

  if (!isAuthenticated) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">Please log in to view your portfolio.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Advanced Header with Navigation */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      Smart Portfolio
                    </h1>
                    <p className="text-sm text-slate-500">AI-Powered Professional Profile</p>
                  </div>
                </div>
                
                {/* View Mode Selector */}
                <div className="hidden md:flex bg-slate-100 rounded-lg p-1">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                    { id: 'editor', label: 'Editor', icon: Edit3 },
                    { id: 'preview', label: 'Preview', icon: Eye }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => setViewMode(mode.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === mode.id
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <mode.icon className="w-4 h-4" />
                      <span>{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="hidden lg:flex"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                
                <Button variant="outline" size="sm" onClick={generatePreview}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Button>
                
                <Button variant="outline" size="sm" onClick={togglePublicSharing}>
                  <Share className="mr-2 h-4 w-4" />
                  {portfolioData?.settings?.isPublic ? 'Private' : 'Share'}
                </Button>
                
                <Button size="sm" onClick={downloadPDF} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                
                <Button 
                  size="sm" 
                  onClick={savePortfolio} 
                  disabled={saving}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard View */}
        {viewMode === 'dashboard' && (
          <div className="p-6 space-y-6">
            {/* Portfolio Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Portfolio Strength</p>
                      <p className="text-3xl font-bold text-blue-900">{portfolioMetrics?.strength || 0}%</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <Progress value={portfolioMetrics?.strength || 0} className="mt-3" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Completeness</p>
                      <p className="text-3xl font-bold text-green-900">{portfolioMetrics?.completeness || 0}%</p>
                    </div>
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <Progress value={portfolioMetrics?.completeness || 0} className="mt-3" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Total Activities</p>
                      <p className="text-3xl font-bold text-purple-900">{portfolioMetrics?.totalActivities || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-purple-600">
                    {portfolioMetrics?.verifiedActivities || 0} verified
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Skills Mastered</p>
                      <p className="text-3xl font-bold text-orange-900">{portfolioMetrics?.totalSkills || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-orange-600">
                    {portfolioMetrics?.recentActivities || 0} recent activities
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Skills Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="w-5 h-5 text-blue-600" />
                    <span>Technical Skills</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(portfolioData?.skills?.technical || []).slice(0, 6).map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{skill}</span>
                        <span className="text-slate-500">{Math.floor(Math.random() * 30) + 70}%</span>
                      </div>
                      <Progress value={Math.floor(Math.random() * 30) + 70} className="h-2" />
                    </div>
                  ))}
                  {(portfolioData?.skills?.technical?.length || 0) === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No technical skills added yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span>Soft Skills</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(portfolioData?.skills?.soft || []).slice(0, 6).map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{skill}</span>
                        <span className="text-slate-500">{Math.floor(Math.random() * 25) + 75}%</span>
                      </div>
                      <Progress value={Math.floor(Math.random() * 25) + 75} className="h-2" />
                    </div>
                  ))}
                  {(portfolioData?.skills?.soft?.length || 0) === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No soft skills added yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Activity Timeline */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <span>Recent Activities Timeline</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search activities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="project">Projects</SelectItem>
                        <SelectItem value="certification">Certifications</SelectItem>
                        <SelectItem value="internship">Internships</SelectItem>
                        <SelectItem value="competition">Competitions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredActivities.length > 0 ? (
                    filteredActivities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-slate-900 truncate">{activity.title}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant={activity.verified ? "default" : "secondary"}>
                                {activity.type}
                              </Badge>
                              {activity.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(activity.date).toLocaleDateString()}</span>
                            </span>
                            {activity.organization && (
                              <span className="flex items-center space-x-1">
                                <Briefcase className="w-3 h-3" />
                                <span>{activity.organization}</span>
                              </span>
                            )}
                            <span className="flex items-center space-x-1">
                              <Star className="w-3 h-3" />
                              <span>{activity.credits || 5} credits</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No activities found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Editor View */}
        {viewMode === 'editor' && (
          <div className="p-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                  <span>Portfolio Editor</span>
                </CardTitle>
                <CardDescription>
                  Edit your portfolio content and customize your professional profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-6 mb-6">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={portfolioData?.personalInfo?.firstName || ''}
                          onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={portfolioData?.personalInfo?.lastName || ''}
                          onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                          placeholder="Enter last name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={portfolioData?.personalInfo?.email || ''}
                          onChange={(e) => updatePersonalInfo('email', e.target.value)}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={portfolioData?.personalInfo?.phone || ''}
                          onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="summary">Professional Summary</Label>
                      <Textarea
                        id="summary"
                        value={portfolioData?.personalInfo?.summary || ''}
                        onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                        placeholder="Write a brief professional summary..."
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="skills" className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm font-medium">Technical Skills</Label>
                          <Button size="sm" variant="outline" onClick={() => {
                            const skill = prompt('Enter technical skill:');
                            if (skill) addSkill('technical', skill);
                          }}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {(portfolioData?.skills?.technical || []).map((skill, index) => (
                            <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                              <span>{skill}</span>
                              <Button size="sm" variant="ghost" onClick={() => removeSkill('technical', index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {(!portfolioData?.skills?.technical || portfolioData.skills.technical.length === 0) && (
                            <p className="text-sm text-slate-500 py-4">No technical skills added yet</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm font-medium">Soft Skills</Label>
                          <Button size="sm" variant="outline" onClick={() => {
                            const skill = prompt('Enter soft skill:');
                            if (skill) addSkill('soft', skill);
                          }}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {(portfolioData?.skills?.soft || []).map((skill, index) => (
                            <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded">
                              <span>{skill}</span>
                              <Button size="sm" variant="ghost" onClick={() => removeSkill('soft', index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {(!portfolioData?.skills?.soft || portfolioData.skills.soft.length === 0) && (
                            <p className="text-sm text-slate-500 py-4">No soft skills added yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="education" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Education</h3>
                      <Button size="sm" onClick={addEducation}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Education
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {(portfolioData?.education || []).map((edu, index) => (
                        <Card key={index} className="p-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Institution</Label>
                              <Input
                                value={edu.institution || ''}
                                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                placeholder="University/College name"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Degree</Label>
                              <Input
                                value={edu.degree || ''}
                                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                placeholder="Bachelor's, Master's, etc."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Field of Study</Label>
                              <Input
                                value={edu.field || ''}
                                onChange={(e) => updateEducation(index, 'field', e.target.value)}
                                placeholder="Computer Science, Engineering, etc."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>CGPA/Grade</Label>
                              <Input
                                value={edu.grade || ''}
                                onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                                placeholder="9.2/10 or A+"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Start Year</Label>
                              <Input
                                type="number"
                                value={edu.startYear || ''}
                                onChange={(e) => updateEducation(index, 'startYear', e.target.value)}
                                placeholder="2020"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>End Year</Label>
                              <Input
                                type="number"
                                value={edu.endYear || ''}
                                onChange={(e) => updateEducation(index, 'endYear', e.target.value)}
                                placeholder="2024"
                              />
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button size="sm" variant="destructive" onClick={() => removeEducation(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                      
                      {(!portfolioData?.education || portfolioData.education.length === 0) && (
                        <div className="text-center py-8 text-slate-500">
                          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No education records added yet</p>
                          <p className="text-sm">Click "Add Education" to get started</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="experience" className="space-y-4">
                    <div className="text-center py-8 text-slate-500">
                      <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Experience section editor coming soon</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="projects" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Projects</h3>
                      <Button size="sm" onClick={addProject}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Project
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {(portfolioData?.projects || []).map((project, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Project Title</Label>
                                <Input
                                  value={project.title || ''}
                                  onChange={(e) => updateProject(index, 'title', e.target.value)}
                                  placeholder="My Awesome Project"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={project.status || 'completed'} onValueChange={(value) => updateProject(index, 'status', value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="planned">Planned</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea
                                value={project.description || ''}
                                onChange={(e) => updateProject(index, 'description', e.target.value)}
                                placeholder="Describe your project, its features, and impact..."
                                rows={3}
                              />
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>GitHub URL</Label>
                                <Input
                                  value={project.githubUrl || ''}
                                  onChange={(e) => updateProject(index, 'githubUrl', e.target.value)}
                                  placeholder="https://github.com/username/project"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Live Demo URL</Label>
                                <Input
                                  value={project.liveUrl || ''}
                                  onChange={(e) => updateProject(index, 'liveUrl', e.target.value)}
                                  placeholder="https://myproject.com"
                                />
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input
                                  type="date"
                                  value={project.startDate || ''}
                                  onChange={(e) => updateProject(index, 'startDate', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input
                                  type="date"
                                  value={project.endDate || ''}
                                  onChange={(e) => updateProject(index, 'endDate', e.target.value)}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Technologies Used</Label>
                              <Input
                                value={(project.technologies || []).join(', ')}
                                onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map(t => t.trim()))}
                                placeholder="React, Node.js, MongoDB, etc."
                              />
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-end">
                            <Button size="sm" variant="destructive" onClick={() => removeProject(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                      
                      {(!portfolioData?.projects || portfolioData.projects.length === 0) && (
                        <div className="text-center py-8 text-slate-500">
                          <Code className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No projects added yet</p>
                          <p className="text-sm">Click "Add Project" to showcase your work</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="achievements" className="space-y-4">
                    <div className="text-center py-8 text-slate-500">
                      <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Achievements section editor coming soon</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Preview View */}
        {viewMode === 'preview' && (
          <div className="p-6 space-y-6">
            {/* Preview Header with Enhanced Actions */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                      Live Portfolio Preview
                    </h2>
                    <p className="text-slate-500 text-sm">Real-time preview of your professional portfolio</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={generatePreview}
                    className="hover:bg-slate-50 border-slate-300 hover:border-slate-400 transition-all duration-200"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Preview
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={downloadPDF} 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>

              {/* Template Selection Quick Bar */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-sm font-medium text-slate-600">Quick Template Switch:</span>
                <div className="flex space-x-2">
                  {[
                    { id: 'modern', name: 'Modern', color: 'bg-blue-500' },
                    { id: 'classic', name: 'Classic', color: 'bg-slate-600' },
                    { id: 'creative', name: 'Creative', color: 'bg-purple-500' },
                    { id: 'academic', name: 'Academic', color: 'bg-green-500' }
                  ].map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        // Auto-generate preview when template changes
                        setTimeout(() => generatePreview(), 100);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        selectedTemplate === template.id
                          ? `${template.color} text-white shadow-md scale-105`
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Preview Container */}
            <Card className="shadow-2xl border-0 overflow-hidden bg-white">
              <CardContent className="p-0">
                {previewUrl ? (
                  <div className="relative">
                    {/* Preview Frame with Enhanced Styling */}
                    <div className="bg-gradient-to-r from-slate-100 to-slate-200 p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                        <div className="flex-1 bg-white rounded-md px-3 py-1 text-xs text-slate-500 font-mono">
                          {previewUrl}
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => window.open(previewUrl, '_blank')}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Enhanced iframe with better styling and error handling */}
                      <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
                        <iframe
                          src={previewUrl}
                          className="w-full h-[700px] border-0"
                          title="Portfolio Preview"
                          style={{ 
                            background: 'white',
                            borderRadius: '8px'
                          }}
                          onLoad={() => {
                            console.log('Portfolio preview loaded successfully');
                          }}
                          onError={() => {
                            console.error('Error loading portfolio preview');
                            toast({
                              title: "Preview Error",
                              description: "Failed to load portfolio preview. Please try refreshing.",
                              variant: "destructive"
                            });
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Floating Action Buttons */}
                    <div className="absolute top-8 right-8 flex flex-col space-y-2">
                      <Button
                        size="sm"
                        className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg border border-slate-200 text-slate-600 hover:text-slate-900 p-0"
                        onClick={() => setIsFullscreen(!isFullscreen)}
                      >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg border border-slate-200 text-slate-600 hover:text-slate-900 p-0"
                        onClick={generatePreview}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
                    {/* Static Portfolio Preview */}
                    <div className="p-8 bg-gradient-to-br from-slate-50 to-white">
                      <div className="max-w-4xl mx-auto">
                        {/* Header Section */}
                        <div className="text-center mb-8">
                          <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl border-4 border-white">
                            <span className="text-3xl font-bold text-white">
                              {portfolioData?.personalInfo?.firstName?.charAt(0) || 'A'}
                              {portfolioData?.personalInfo?.lastName?.charAt(0) || 'S'}
                            </span>
                          </div>
                          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent mb-3">
                            {portfolioData?.personalInfo?.firstName || 'Arjun'} {portfolioData?.personalInfo?.lastName || 'Sharma'}
                          </h1>
                          <div className="flex items-center justify-center space-x-4 mb-4">
                            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
                              <Mail className="w-4 h-4 text-blue-600" />
                              <span className="text-blue-700 font-medium">
                                {portfolioData?.personalInfo?.email || 'arjun.sharma@university.edu'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
                              <MapPin className="w-4 h-4 text-green-600" />
                              <span className="text-green-700 font-medium">
                                {portfolioData?.personalInfo?.location || 'Mumbai, India'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-center space-x-6 mb-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-slate-900">
                                {portfolioData?.personalInfo?.rollNumber || 'CS21B1234'}
                              </div>
                              <div className="text-sm text-slate-500">Roll Number</div>
                            </div>
                            <div className="w-px h-8 bg-slate-300"></div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {portfolioData?.personalInfo?.cgpa || '8.7'}
                              </div>
                              <div className="text-sm text-slate-500">CGPA</div>
                            </div>
                            <div className="w-px h-8 bg-slate-300"></div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {portfolioData?.personalInfo?.year || '3rd'} Year
                              </div>
                              <div className="text-sm text-slate-500">
                                {portfolioData?.personalInfo?.department || 'Computer Science'}
                              </div>
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                            <p className="text-slate-700 max-w-3xl mx-auto leading-relaxed text-lg">
                              {portfolioData?.personalInfo?.summary || 'Passionate Computer Science student with expertise in full-stack development, machine learning, and cloud technologies. Experienced in leading technical projects and mentoring junior students. Seeking opportunities to contribute to innovative software solutions and make a meaningful impact in the tech industry.'}
                            </p>
                          </div>
                        </div>

                        {/* Skills Section */}
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
                            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                              <Code className="w-6 h-6 mr-3 text-blue-600" />
                              Technical Skills
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              {(portfolioData?.skills?.technical || ['React', 'JavaScript', 'Python', 'Node.js', 'MongoDB', 'AWS', 'Docker', 'Git', 'TypeScript', 'Machine Learning']).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-3 py-1 text-sm font-medium hover:from-blue-200 hover:to-blue-300 transition-all duration-200">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="bg-white rounded-xl p-6 shadow-lg border border-green-100">
                            <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center">
                              <Users className="w-6 h-6 mr-3 text-green-600" />
                              Soft Skills
                            </h3>
                            <div className="flex flex-wrap gap-3">
                              {(portfolioData?.skills?.soft || ['Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Project Management', 'Public Speaking', 'Critical Thinking', 'Adaptability']).map((skill, index) => (
                                <Badge key={index} variant="secondary" className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-1 text-sm font-medium hover:from-green-200 hover:to-green-300 transition-all duration-200">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Education Section */}
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 mb-8">
                          <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                            <GraduationCap className="w-6 h-6 mr-3 text-purple-600" />
                            Education
                          </h3>
                          {(portfolioData?.education || []).length > 0 ? (
                            <div className="space-y-6">
                              {portfolioData.education.map((edu, index) => (
                                <div key={index} className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border-l-4 border-purple-500">
                                  <h4 className="font-bold text-slate-900 text-lg">{edu.degree}</h4>
                                  <p className="text-purple-700 font-medium">{edu.institution}</p>
                                  <p className="text-sm text-slate-600 mt-1">{edu.startYear} - {edu.endYear}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
                              <div className="text-center">
                                <h4 className="font-bold text-slate-900 text-lg mb-2">Bachelor of Technology - Computer Science</h4>
                                <p className="text-purple-700 font-medium">Indian Institute of Technology, Mumbai</p>
                                <p className="text-slate-600 mt-1">2021 - 2025</p>
                                <div className="flex items-center justify-center space-x-4 mt-4">
                                  <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                                    <span className="text-sm text-slate-500">Current CGPA</span>
                                    <div className="text-xl font-bold text-purple-600">8.7/10</div>
                                  </div>
                                  <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                                    <span className="text-sm text-slate-500">Semester</span>
                                    <div className="text-xl font-bold text-indigo-600">6th</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Projects Section */}
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-100 mb-8">
                          <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                            <Briefcase className="w-6 h-6 mr-3 text-orange-600" />
                            Featured Projects
                          </h3>
                          {(portfolioData?.projects || []).length > 0 ? (
                            <div className="grid gap-6">
                              {portfolioData.projects.slice(0, 3).map((project, index) => (
                                <div key={index} className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-5 hover:shadow-md transition-all duration-200">
                                  <h4 className="font-bold text-slate-900 text-lg mb-2">{project.title}</h4>
                                  <p className="text-slate-700 mb-4 leading-relaxed">{project.description}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {(project.technologies || []).map((tech, techIndex) => (
                                      <Badge key={techIndex} variant="outline" className="bg-white border-orange-300 text-orange-700 hover:bg-orange-50">
                                        {tech}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="grid gap-6">
                              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-5">
                                <h4 className="font-bold text-slate-900 text-lg mb-2">Smart Student Hub</h4>
                                <p className="text-slate-700 mb-4 leading-relaxed">A comprehensive platform for student portfolio management with real-time activity tracking, faculty approvals, and automated portfolio generation. Built with modern web technologies.</p>
                                <div className="flex flex-wrap gap-2">
                                  {['React', 'TypeScript', 'Node.js', 'MongoDB', 'Tailwind CSS'].map((tech, techIndex) => (
                                    <Badge key={techIndex} variant="outline" className="bg-white border-orange-300 text-orange-700">
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-5">
                                <h4 className="font-bold text-slate-900 text-lg mb-2">AI-Powered Study Assistant</h4>
                                <p className="text-slate-700 mb-4 leading-relaxed">Machine learning application that provides personalized study recommendations and tracks learning progress. Implemented using Python and TensorFlow.</p>
                                <div className="flex flex-wrap gap-2">
                                  {['Python', 'TensorFlow', 'Flask', 'PostgreSQL', 'Docker'].map((tech, techIndex) => (
                                    <Badge key={techIndex} variant="outline" className="bg-white border-orange-300 text-orange-700">
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-5">
                                <h4 className="font-bold text-slate-900 text-lg mb-2">Campus Event Management System</h4>
                                <p className="text-slate-700 mb-4 leading-relaxed">Full-stack web application for managing campus events with real-time notifications, registration system, and analytics dashboard.</p>
                                <div className="flex flex-wrap gap-2">
                                  {['Vue.js', 'Express.js', 'MySQL', 'Socket.io', 'AWS'].map((tech, techIndex) => (
                                    <Badge key={techIndex} variant="outline" className="bg-white border-orange-300 text-orange-700">
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Activities Section */}
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-yellow-100">
                          <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
                            <Trophy className="w-6 h-6 mr-3 text-yellow-600" />
                            Recent Achievements & Activities
                          </h3>
                          {(portfolioData?.activities || []).length > 0 ? (
                            <div className="space-y-4">
                              {portfolioData.activities.slice(0, 5).map((activity, index) => (
                                <div key={index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 hover:shadow-md transition-all duration-200">
                                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Trophy className="w-6 h-6 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-bold text-slate-900 text-lg">{activity.title}</p>
                                    <p className="text-yellow-700 font-medium">{activity.organization}</p>
                                  </div>
                                  <Badge variant={activity.verified ? "default" : "secondary"} className="bg-white border-yellow-400 text-yellow-700 px-3 py-1">
                                    {activity.credits || 5} credits
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Trophy className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-slate-900 text-lg">National Coding Championship - 2nd Place</p>
                                  <p className="text-yellow-700 font-medium">CodeChef & HackerRank</p>
                                </div>
                                <Badge className="bg-white border-yellow-400 text-yellow-700 px-3 py-1">15 credits</Badge>
                              </div>
                              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Award className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-slate-900 text-lg">Technical Lead - Student Council</p>
                                  <p className="text-yellow-700 font-medium">IIT Mumbai Student Body</p>
                                </div>
                                <Badge className="bg-white border-yellow-400 text-yellow-700 px-3 py-1">20 credits</Badge>
                              </div>
                              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                                  <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-slate-900 text-lg">Research Paper Published</p>
                                  <p className="text-yellow-700 font-medium">IEEE Conference on AI & ML</p>
                                </div>
                                <Badge className="bg-white border-yellow-400 text-yellow-700 px-3 py-1">25 credits</Badge>
                              </div>
                              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Users className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-slate-900 text-lg">Volunteer Coordinator</p>
                                  <p className="text-yellow-700 font-medium">Tech for Good Initiative</p>
                                </div>
                                <Badge className="bg-white border-yellow-400 text-yellow-700 px-3 py-1">10 credits</Badge>
                              </div>
                              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                  <Star className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-slate-900 text-lg">Dean's List Recognition</p>
                                  <p className="text-yellow-700 font-medium">Academic Excellence Award</p>
                                </div>
                                <Badge className="bg-white border-yellow-400 text-yellow-700 px-3 py-1">30 credits</Badge>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Generate Button */}
                        <div className="text-center mt-8">
                          <Button 
                            onClick={generatePreview}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Generate Live Preview
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Template Gallery */}
            <Card className="mt-6 shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layout className="w-5 h-5 text-purple-600" />
                  <span>Professional Templates</span>
                </CardTitle>
                <CardDescription>
                  Choose from beautifully designed templates optimized for different industries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { 
                      id: 'modern', 
                      name: 'Modern Tech', 
                      description: 'Perfect for software developers and tech professionals',
                      color: 'from-blue-500 to-indigo-600',
                      icon: Code
                    },
                    { 
                      id: 'classic', 
                      name: 'Corporate Classic', 
                      description: 'Traditional design for business and finance roles',
                      color: 'from-slate-600 to-slate-800',
                      icon: Briefcase
                    },
                    { 
                      id: 'creative', 
                      name: 'Creative Studio', 
                      description: 'Vibrant layout for designers and creative professionals',
                      color: 'from-purple-500 to-pink-600',
                      icon: Sparkles
                    },
                    { 
                      id: 'academic', 
                      name: 'Academic Scholar', 
                      description: 'Clean design for researchers and academics',
                      color: 'from-green-500 to-emerald-600',
                      icon: GraduationCap
                    }
                  ].map((template) => (
                    <div
                      key={template.id}
                      className={`group border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className={`aspect-video bg-gradient-to-br ${template.color} rounded-lg mb-3 flex items-center justify-center shadow-inner`}>
                        <template.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
                      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                        {template.description}
                      </p>
                      {selectedTemplate === template.id ? (
                        <div className="flex items-center text-blue-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Active
                        </div>
                      ) : (
                        <div className="text-slate-400 text-sm">
                          Click to select
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Theme Customization */}
                <div className="mt-8 p-6 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold mb-4 flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-yellow-600" />
                    Theme Customization
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Primary Color</Label>
                      <div className="grid grid-cols-8 gap-2">
                        {[
                          '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
                          '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
                        ].map((color) => (
                          <div
                            key={color}
                            className="w-8 h-8 rounded-full cursor-pointer border-2 border-white shadow-md hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              setPortfolioData(prev => ({
                                ...prev,
                                theme: { ...prev?.theme, primaryColor: color }
                              }));
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Font Style</Label>
                      <Select 
                        value={portfolioData?.theme?.fontFamily || 'inter'} 
                        onValueChange={(value) => {
                          setPortfolioData(prev => ({
                            ...prev,
                            theme: { ...prev?.theme, fontFamily: value }
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inter">Inter (Modern)</SelectItem>
                          <SelectItem value="roboto">Roboto (Clean)</SelectItem>
                          <SelectItem value="playfair">Playfair Display (Elegant)</SelectItem>
                          <SelectItem value="poppins">Poppins (Friendly)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Public URL Display */}
        {portfolioData?.settings?.isPublic && portfolioData?.settings?.publicUrl && (
          <div className="p-6 pt-0">
            <Card className="bg-green-50 border-green-200 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">Portfolio is public</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="bg-green-100 px-3 py-1 rounded text-sm font-mono">
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
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default StudentPortfolio;