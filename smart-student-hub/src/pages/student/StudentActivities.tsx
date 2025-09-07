import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, Upload, Calendar, CheckCircle, Clock, XCircle, Plus, Filter } from "lucide-react";
import { useState, useEffect } from "react";

const StudentActivities = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/activity", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setActivities(data.activities);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-success" />;
      case "pending": return <Clock className="h-4 w-4 text-warning" />;
      case "rejected": return <XCircle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-success text-success-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "rejected": return "bg-destructive text-destructive-foreground";
      default: return "";
    }
  };
  
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    date: "",
    credits: "",
    description: "",
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please select a certificate file.");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("type", formData.type);
    data.append("date", formData.date);
    data.append("credits", formData.credits);
    data.append("description", formData.description);
    data.append("certificate", selectedFile);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/activity/upload-certificate", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });
  
      const result = await res.json();
      if (res.ok) {
        alert("Activity submitted ✅");
        setActivities(prev => [result.activity, ...prev]);
        setOpen(false);
        setFormData({ title: "", type: "", date: "", credits: "", description: "" });
        setSelectedFile(null);
      } else {
        alert(result.message || "Failed to submit");
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Activities</h1>
            <p className="text-muted-foreground">Manage and track your academic activities</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Activity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Activity</DialogTitle>
                <DialogDescription>
                  Submit your activity for verification and approval
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Activity Title</Label>
                    <Input id="title" placeholder="Enter activity title" onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="type">Activity Type</Label>
                    <Select onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="competition">Competition</SelectItem>
                        <SelectItem value="certification">Certification</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="volunteering">Volunteering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" onChange={(e) => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div>
                    <Label htmlFor="credits">Expected Credits</Label>
                    <Input id="credits" type="number" placeholder="10" onChange={(e) => setFormData({...formData, credits: e.target.value})}/>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe your activity..." onChange={(e) => setFormData({...formData, description: e.target.value})}/>
                </div>
                <div>
                  <Label htmlFor="certificate">Upload Certificate/Proof</Label>
                  <Input id="certificate" type="file" onChange={handleFileChange} />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleSubmit}>Submit for Approval</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="competition">Competition</SelectItem>
                  <SelectItem value="certification">Certification</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {activities.map((activity) => (
            <Card key={activity._id || activity.id} className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">{activity.title}</h3>
                      <Badge variant="outline">{activity.type}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{activity.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(activity.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Trophy className="h-4 w-4" />
                        <span>{activity.credits} credits</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(activity.status)}
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-primary text-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{activities.length}</div>
                <div className="text-white/80">Total Activities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{activities.filter(a => a.status === 'approved').length}</div>
                <div className="text-white/80">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{activities.filter(a => a.status === 'pending').length}</div>
                <div className="text-white/80">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{activities.filter(a => a.status === 'approved').reduce((sum, a) => sum + (parseInt(a.credits) || 0), 0)}</div>
                <div className="text-white/80">Total Credits</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default StudentActivities;