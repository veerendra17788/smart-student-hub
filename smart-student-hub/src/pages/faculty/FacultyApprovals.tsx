import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, Clock, XCircle, Eye, MessageSquare, Filter } from "lucide-react";
import { useEffect, useState } from "react";

const FacultyApprovals = () => {
  const [pendingActivities, setPendingActivities] = useState<any[]>([]);
  const [approvedActivities, setApprovedActivities] = useState<any[]>([]);
  const [rejectedActivities, setRejectedActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:5000/api/faculty/activities", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.activities) {
        setPendingActivities(data.activities.filter((a: any) => a.status === "pending"));
        setApprovedActivities(data.activities.filter((a: any) => a.status === "approved"));
        setRejectedActivities(data.activities.filter((a: any) => a.status === "rejected"));
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

  if (loading) return <AppLayout><p>Loading activities...</p></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
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

          {/* Pending Approvals */}
          <TabsContent value="pending" className="space-y-4">
            {pendingActivities.length === 0 ? (
              <p>No pending activities</p>
            ) : pendingActivities.map((approval) => (
              <Card key={approval._id} className="bg-gradient-card border-0 shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-3">
                        <span>{approval.studentName}</span>
                        <Badge variant="outline">{approval.rollNumber}</Badge>
                        {approval.urgent && <Badge className="bg-destructive text-destructive-foreground">Urgent</Badge>}
                      </CardTitle>
                      <CardDescription>{approval.activity}</CardDescription>
                    </div>
                    <Badge className="bg-warning text-warning-foreground">{approval.credits} credits</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div><span className="font-medium">Activity Type:</span> {approval.type}</div>
                      <div><span className="font-medium">Activity Date:</span> {approval.date}</div>
                      <div><span className="font-medium">Submitted:</span> {approval.submissionDate}</div>
                      <div><span className="font-medium">Documents:</span> {approval.documents?.length || 0} files</div>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Description:</span>
                      <p className="text-sm text-muted-foreground mt-1">{approval.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t space-x-2">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => alert("View Documents")}>
                          <Eye className="mr-2 h-4 w-4" /> View Documents
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => alert("Add Comment")}>
                          <MessageSquare className="mr-2 h-4 w-4" /> Add Comment
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-success text-success-foreground" onClick={() => handleApprove(approval._id)}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Approve
                        </Button>
                        <Button size="sm" className="bg-destructive text-destructive-foreground" onClick={() => handleReject(approval._id, "Rejected by faculty")}>
                          <XCircle className="mr-2 h-4 w-4" /> Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Approved Activities */}
          <TabsContent value="approved" className="space-y-4">
            {approvedActivities.length === 0 ? <p>No approved activities</p> : approvedActivities.map((activity) => (
              <Card key={activity._id} className="bg-gradient-card border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{activity.studentName}</h3>
                      <p className="text-sm text-muted-foreground">{activity.activity}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>Approved by: {activity.approvedBy}</span>
                        <span>Date: {activity.approvedDate}</span>
                        <span>{activity.credits} credits</span>
                      </div>
                    </div>
                    <Badge className="bg-success text-success-foreground">Approved</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Rejected Activities */}
          <TabsContent value="rejected" className="space-y-4">
            {rejectedActivities.length === 0 ? <p>No rejected activities</p> : rejectedActivities.map((activity) => (
              <Card key={activity._id} className="bg-gradient-card border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{activity.studentName}</h3>
                      <p className="text-sm text-muted-foreground">{activity.activity}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>Rejected by: {activity.rejectedBy}</span>
                        <span>Date: {activity.rejectedDate}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-medium">Reason:</span>
                        <p className="text-xs text-muted-foreground">{activity.reason}</p>
                      </div>
                    </div>
                    <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default FacultyApprovals;
