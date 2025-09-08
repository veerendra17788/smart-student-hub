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
import { User, Mail, Phone, MapPin, GraduationCap, Edit, Plus, Calendar, BookOpen, Award, Activity } from "lucide-react";
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [user?.rollNumber, toast]);

  if (loading) {
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

  const skills = extractSkillsFromActivities(studentData.activities);
  const interests = getInterestsFromActivities(studentData.activities);
  const nameParts = studentData.name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

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
                    <Badge variant="secondary">{skills.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No skills extracted from activities yet</p>
                    )}
                  </div>
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