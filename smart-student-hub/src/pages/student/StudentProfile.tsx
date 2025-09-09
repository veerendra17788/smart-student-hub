import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, Phone, MapPin, GraduationCap, Edit, Plus, Calendar, BookOpen, Award, Activity, X, Check, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface StudentData {
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  age: number;
  department: string;
  year: number;
  section: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  fullAddress: string;
  cgpa: number;
  currentSemester: number;
  overallAttendancePercentage: number;
  bloodGroup?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  profilePicture?: string;
  skills?: string[];
  activities: Array<{
    type: string;
    title: string;
    description?: string;
    organization?: string;
    startDate?: string;
    endDate?: string;
    status: string;
    skills?: string[];
  }>;
  semesterGrades: Array<{
    semester: number;
    sgpa: number;
    subjects: Array<{
      subjectCode: string;
      subjectName: string;
      grade: string;
      credits: number;
      marks?: number;
    }>;
  }>;
  attendance: Array<{
    subjectCode: string;
    subjectName: string;
    totalClasses: number;
    attendedClasses: number;
    attendancePercentage: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

const StudentProfile = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [editableSkills, setEditableSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [savingSkills, setSavingSkills] = useState(false);

  // Extract skills from activities
  const extractSkillsFromActivities = (activities: StudentData['activities']) => {
    const skillsSet = new Set<string>();
    activities.forEach(activity => {
      if (activity.skills) {
        activity.skills.forEach(skill => skillsSet.add(skill));
      }
    });
    return Array.from(skillsSet);
  };

  // Get activity types as interests
  const getInterestsFromActivities = (activities: StudentData['activities']) => {
    const interestsSet = new Set<string>();
    activities.forEach(activity => {
      interestsSet.add(activity.type.charAt(0).toUpperCase() + activity.type.slice(1));
    });
    return Array.from(interestsSet);
  };

  useEffect(() => {
    const fetchStudentProfile = async () => {
      // Wait for auth to finish loading before checking user
      if (authLoading) {
        return;
      }
      
      if (!user?.rollNumber) {
        setError("Roll number not found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/student/profile/${user.rollNumber}`);
        const data = await response.json();

        if (data.success) {
          setStudentData(data.data);
        } else {
          setError(data.message || "Failed to fetch profile data");
          toast({
            title: "Error",
            description: data.message || "Failed to fetch profile data",
            variant: "destructive",
          });
        }
      } catch (err) {
        const errorMessage = "Failed to connect to server. Please ensure the backend is running.";
        setError(errorMessage);
        toast({
          title: "Connection Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [user?.rollNumber, authLoading, toast]);

  if (loading || authLoading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                <Skeleton className="h-6 w-32 mx-auto mb-2" />
                <Skeleton className="h-4 w-40 mx-auto mb-2" />
                <Skeleton className="h-6 w-20 mx-auto" />
              </CardHeader>
            </Card>
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i}>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !studentData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-red-600">Error Loading Profile</CardTitle>
              <CardDescription>{error || "Student data not found"}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // Combine skills from activities and direct skills field
  const activitySkills = extractSkillsFromActivities(studentData.activities);
  const directSkills = studentData.skills || [];
  const allSkills = [...new Set([...directSkills, ...activitySkills])];
  const interests = getInterestsFromActivities(studentData.activities);
  const nameParts = studentData.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Skills editing functions
  const handleEditSkills = () => {
    setEditableSkills([...allSkills]);
    setIsEditingSkills(true);
  };

  const handleCancelEdit = () => {
    setIsEditingSkills(false);
    setEditableSkills([]);
    setNewSkill("");
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !editableSkills.includes(newSkill.trim())) {
      setEditableSkills([...editableSkills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditableSkills(editableSkills.filter(skill => skill !== skillToRemove));
  };

  const handleSaveSkills = async () => {
    if (!user?.rollNumber) return;
    
    setSavingSkills(true);
    try {
      const response = await fetch(`http://localhost:5000/api/student/${user.rollNumber}/skills`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skills: editableSkills }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the student data with new skills
        setStudentData(prev => prev ? { ...prev, skills: editableSkills } : null);
        setIsEditingSkills(false);
        setEditableSkills([]);
        toast({
          title: "Success",
          description: "Skills updated successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update skills",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setSavingSkills(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Profile</h1>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <Card className="lg:col-span-1 bg-gradient-card border-0 shadow-lg">
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={studentData.profilePicture} />
                <AvatarFallback className="text-2xl">{studentData.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle>{studentData.name}</CardTitle>
              <CardDescription>{studentData.department}</CardDescription>
              <Badge className="mx-auto">{studentData.rollNumber}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{studentData.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{studentData.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{studentData.fullAddress}</span>
              </div>
              {studentData.bloodGroup && (
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Blood Group: {studentData.bloodGroup}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={firstName} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={lastName} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={studentData.email} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={studentData.phone} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Input id="gender" value={studentData.gender} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" value={studentData.age.toString()} readOnly />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="section">Section</Label>
                    <Input id="section" value={studentData.section} readOnly />
                  </div>
                  {studentData.bloodGroup && (
                    <div>
                      <Label htmlFor="bloodGroup">Blood Group</Label>
                      <Input id="bloodGroup" value={studentData.bloodGroup} readOnly />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="mr-2 h-5 w-5" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input id="rollNumber" value={studentData.rollNumber} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" value={studentData.department} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="year">Year</Label>
                    <Input id="year" value={`${studentData.year}${studentData.year === 1 ? 'st' : studentData.year === 2 ? 'nd' : studentData.year === 3 ? 'rd' : 'th'} Year`} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="cgpa">CGPA</Label>
                    <Input id="cgpa" value={studentData.cgpa.toFixed(2)} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="currentSemester">Current Semester</Label>
                    <Input id="currentSemester" value={studentData.currentSemester.toString()} readOnly />
                  </div>
                  <div>
                    <Label htmlFor="attendance">Overall Attendance</Label>
                    <Input id="attendance" value={`${studentData.overallAttendancePercentage}%`} readOnly />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            {studentData.emergencyContact && (
              <Card className="bg-gradient-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2 h-5 w-5" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="emergencyName">Name</Label>
                      <Input id="emergencyName" value={studentData.emergencyContact.name} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="emergencyPhone">Phone</Label>
                      <Input id="emergencyPhone" value={studentData.emergencyContact.phone} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="emergencyRelation">Relation</Label>
                      <Input id="emergencyRelation" value={studentData.emergencyContact.relation} readOnly />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activities Summary */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="mr-2 h-5 w-5" />
                    Activities Summary
                  </div>
                  <Badge variant="secondary">{studentData.activities.length} Total</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {['competition', 'certification', 'internship', 'project', 'workshop', 'seminar'].map(type => {
                    const count = studentData.activities.filter(activity => activity.type === type).length;
                    return (
                      <div key={type} className="p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{count}</div>
                        <div className="text-sm text-muted-foreground capitalize">{type}s</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Skills & Interests */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-gradient-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Skills
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{allSkills.length}</Badge>
                      {!isEditingSkills && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEditSkills}
                          className="h-6 px-2"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditingSkills ? (
                    <div className="space-y-4">
                      {/* Add new skill input */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a new skill..."
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddSkill();
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={handleAddSkill}
                          disabled={!newSkill.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Editable skills list */}
                      <div className="flex flex-wrap gap-2">
                        {editableSkills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 pr-1"
                          >
                            {skill}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveSkill(skill)}
                              className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={handleSaveSkills}
                          disabled={savingSkills}
                        >
                          {savingSkills ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={savingSkills}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {allSkills.length > 0 ? (
                        allSkills.map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No skills added yet. Click the edit button to add your skills.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Activity Areas
                    <Badge variant="secondary">{interests.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {interests.length > 0 ? (
                      interests.map((interest) => (
                        <Badge key={interest} variant="outline">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No activities recorded yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentProfile;