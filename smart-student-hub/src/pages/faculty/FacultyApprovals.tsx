import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock, XCircle, Eye, MessageSquare, Filter, FileText, Calendar, User, Award, AlertTriangle, Shield, ExternalLink, Download } from "lucide-react";
import { useEffect, useState } from "react";

const FacultyApprovals = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchActivities = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/faculty/activities", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.activities) {
        setActivities(data.activities);
      } else {
        console.error(data.message || "Failed to fetch activities");
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleApprove = async (id: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/faculty/activities/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ facultyName: "Dr. Smith" }),
      });
      if (res.ok) fetchActivities();
    } catch (err) {
      console.error("Error approving activity:", err);
    }
  };

  const handleReject = async (id: string, reason: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:5000/api/faculty/activities/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason, facultyName: "Dr. Smith" }),
      });
      if (res.ok) fetchActivities();
    } catch (err) {
      console.error("Error rejecting activity:", err);
    }
  };

  const pendingActivities = activities.filter(a => a.status === "pending" || a.status === "ai-approved" || a.status === "ai-rejected");
  const approvedActivities = activities.filter(a => a.status === "approved");
  const rejectedActivities = activities.filter(a => a.status === "rejected");

  if (loading) return <AppLayout><p>Loading activities...</p></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Activity Approvals</h1>
            <p className="text-muted-foreground">Review and approve student activity submissions</p>
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Pending ({pendingActivities.length})</span>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Approved ({approvedActivities.length})</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center space-x-2">
              <XCircle className="h-4 w-4" />
              <span>Rejected ({rejectedActivities.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingActivities.length === 0 ? (
              <Card className="p-8 text-center">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Pending Activities</h3>
                <p className="text-muted-foreground">All activities have been reviewed.</p>
              </Card>
            ) : (
              pendingActivities.map((activity) => (
                <Card key={activity._id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-lg">{activity.studentId?.name || 'Unknown Student'}</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <CardDescription className="text-base">{activity.title}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(activity.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Award className="h-3 w-3" />
                            <span>{activity.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant="outline" className="font-semibold">
                          {activity.credits} credits
                        </Badge>
                        {activity.aiDecision && (
                          <Badge 
                            variant={activity.aiDecision === 'approved' ? 'default' : activity.aiDecision === 'rejected' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            AI: {activity.aiDecision}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">{activity.description}</p>
                      
                      {activity.aiAnalysis && (
                        <Alert className={activity.aiDecision === 'rejected' ? 'border-destructive' : activity.aiDecision === 'approved' ? 'border-green-500' : 'border-yellow-500'}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>AI Analysis:</strong> {activity.aiAnalysis.reasoning || 'Analysis completed'}
                            {activity.aiAnalysis.confidence && (
                              <span className="ml-2 text-xs">({activity.aiAnalysis.confidence}% confidence)</span>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          {activity.certificatePath && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={`http://localhost:5000/${activity.certificatePath}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-3 w-3" /> View Certificate
                              </a>
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Eye className="mr-2 h-3 w-3" /> Full Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                  <FileText className="h-5 w-5" />
                                  <span>{activity.title}</span>
                                </DialogTitle>
                                <DialogDescription>{activity.studentId?.name} • {activity.type}</DialogDescription>
                              </DialogHeader>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-semibold">Activity Details</Label>
                                    <div className="mt-2 space-y-2 text-sm">
                                      <p><strong>Description:</strong> {activity.description}</p>
                                      <p><strong>Date:</strong> {new Date(activity.date).toLocaleDateString()}</p>
                                      <p><strong>Credits:</strong> {activity.credits}</p>
                                      <p><strong>Type:</strong> {activity.type}</p>
                                    </div>
                                  </div>
                                  
                                  {activity.aiMetadata && (
                                    <div>
                                      <Label className="text-sm font-semibold">Extracted Information</Label>
                                      <div className="mt-2 space-y-1 text-sm">
                                        <p><strong>Organization:</strong> {activity.aiMetadata.organization || 'N/A'}</p>
                                        <p><strong>Course:</strong> {activity.aiMetadata.courseName || 'N/A'}</p>
                                        <p><strong>Participant:</strong> {activity.aiMetadata.participantName || 'N/A'}</p>
                                        <p><strong>Completion Date:</strong> {activity.aiMetadata.completionDate || 'N/A'}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-4">
                                  {activity.aiAnalysis && (
                                    <div>
                                      <Label className="text-sm font-semibold">AI Analysis Report</Label>
                                      <div className="mt-2 space-y-2 text-sm">
                                        <div className="flex items-center space-x-2">
                                          <Badge variant={activity.aiDecision === 'approved' ? 'default' : activity.aiDecision === 'rejected' ? 'destructive' : 'secondary'}>
                                            {activity.aiDecision}
                                          </Badge>
                                          {activity.aiAnalysis.confidence && (
                                            <span className="text-xs text-muted-foreground">{activity.aiAnalysis.confidence}% confidence</span>
                                          )}
                                        </div>
                                        <p><strong>Authenticity:</strong> {activity.aiAnalysis.authenticity || 'N/A'}</p>
                                        <p><strong>Content Match:</strong> {activity.aiAnalysis.contentMatch || 'N/A'}</p>
                                        <p><strong>Reasoning:</strong> {activity.aiAnalysis.reasoning || 'N/A'}</p>
                                        {activity.aiAnalysis.discrepancies && activity.aiAnalysis.discrepancies.length > 0 && (
                                          <div>
                                            <strong>Issues Found:</strong>
                                            <ul className="list-disc list-inside mt-1 space-y-1">
                                              {activity.aiAnalysis.discrepancies.map((issue: string, index: number) => (
                                                <li key={index} className="text-destructive">{issue}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {activity.certificatePath && (
                                    <div>
                                      <Label className="text-sm font-semibold">Certificate</Label>
                                      <div className="mt-2">
                                        <Button size="sm" variant="outline" asChild className="w-full">
                                          <a href={`http://localhost:5000/${activity.certificatePath}`} target="_blank" rel="noopener noreferrer">
                                            <Download className="mr-2 h-3 w-3" /> Download Certificate
                                          </a>
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <Separator className="my-4" />
                              
                              <div className="flex justify-end space-x-2">
                                <Button 
                                  className="bg-green-600 hover:bg-green-700 text-white" 
                                  onClick={() => handleApprove(activity._id)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" /> Approve Activity
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="destructive">
                                      <XCircle className="mr-2 h-4 w-4" /> Reject Activity
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reject Activity</DialogTitle>
                                      <DialogDescription>Please provide a reason for rejection.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="reason">Rejection Reason</Label>
                                        <Textarea 
                                          id="reason"
                                          placeholder="Please explain why this activity is being rejected..."
                                          value={rejectReason}
                                          onChange={(e) => setRejectReason(e.target.value)}
                                        />
                                      </div>
                                      <div className="flex justify-end space-x-2">
                                        <Button variant="outline" onClick={() => setRejectReason("")}>
                                          Cancel
                                        </Button>
                                        <Button 
                                          variant="destructive" 
                                          onClick={() => {
                                            handleReject(activity._id, rejectReason);
                                            setRejectReason("");
                                          }}
                                          disabled={!rejectReason.trim()}
                                        >
                                          Reject Activity
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApprove(activity._id)}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" /> Approve
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <XCircle className="mr-1 h-3 w-3" /> Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Activity</DialogTitle>
                                <DialogDescription>Provide a reason for rejection.</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea 
                                  placeholder="Rejection reason..."
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setRejectReason("")}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => {
                                      handleReject(activity._id, rejectReason);
                                      setRejectReason("");
                                    }}
                                    disabled={!rejectReason.trim()}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedActivities.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Approved Activities</h3>
                <p className="text-muted-foreground">Approved activities will appear here.</p>
              </Card>
            ) : (
              approvedActivities.map((activity) => (
                <Card key={activity._id} className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-lg">{activity.studentId?.name || 'Unknown Student'}</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <CardDescription className="text-base">{activity.title}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(activity.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Award className="h-3 w-3" />
                            <span>{activity.type}</span>
                          </div>
                          {activity.approvedDate && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span>Approved {new Date(activity.approvedDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant="default" className="bg-green-600">
                          {activity.credits} credits
                        </Badge>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      
                      {activity.approvedBy && (
                        <div className="text-sm">
                          <span className="font-medium">Approved by:</span> {activity.approvedBy}
                        </div>
                      )}
                      
                      <div className="bg-white p-4 rounded-lg border">
                        <h4 className="font-semibold text-sm mb-3 flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          Blockchain Verification
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <Label className="text-muted-foreground">Certificate Hash</Label>
                            <p className="font-mono bg-gray-100 p-2 rounded mt-1 break-all">
                              {activity.blockchainHash || 'Not available'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Transaction ID</Label>
                            <p className="font-mono bg-gray-100 p-2 rounded mt-1 break-all">
                              {activity.transactionId || 'Not available'}
                            </p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">IPFS CID</Label>
                            <p className="font-mono bg-gray-100 p-2 rounded mt-1 break-all">
                              {activity.ipfsCid || 'Not available'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        {activity.certificatePath && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={`http://localhost:5000/${activity.certificatePath}`} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 h-3 w-3" /> Download Certificate
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedActivities.length === 0 ? (
              <Card className="p-8 text-center">
                <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Rejected Activities</h3>
                <p className="text-muted-foreground">Rejected activities will appear here.</p>
              </Card>
            ) : (
              rejectedActivities.map((activity) => (
                <Card key={activity._id} className="border-red-200 bg-red-50/50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-lg">{activity.studentId?.name || 'Unknown Student'}</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <CardDescription className="text-base">{activity.title}</CardDescription>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(activity.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Award className="h-3 w-3" />
                            <span>{activity.type}</span>
                          </div>
                          {activity.rejectedDate && (
                            <div className="flex items-center space-x-1">
                              <XCircle className="h-3 w-3 text-red-600" />
                              <span>Rejected {new Date(activity.rejectedDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge variant="outline" className="text-red-700 border-red-300">
                          <XCircle className="h-3 w-3 mr-1" />
                          Rejected
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      
                      <Alert className="border-red-200">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Rejection Reason:</strong> {activity.reason || 'No reason provided'}
                        </AlertDescription>
                      </Alert>
                      
                      {activity.rejectedBy && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Rejected by:</span> {activity.rejectedBy}
                        </div>
                      )}
                      
                      {activity.certificatePath && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={`http://localhost:5000/${activity.certificatePath}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-3 w-3" /> View Original Certificate
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default FacultyApprovals;
