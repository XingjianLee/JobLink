import { useState, useEffect } from "react";
import { CompanyLayout } from "@/components/layout/CompanyLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  FileText,
  MapPin,
  Clock,
  MoreVertical,
  Eye,
  CheckCircle2,
  XCircle,
  Calendar,
  CalendarIcon,
  Loader2,
  Mail,
  Phone,
  Download,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface InterviewRound {
  id: string;
  round: number;
  title: string;
  interview_date: string;
  interviewer: string;
  interview_format: string;
  score: number | null;
  notes?: string;
  status: string;
}

interface Application {
  id: string;
  job_id: string;
  jobTitle: string;
  status: string;
  applied_at: string;
  cover_letter: string | null;
  resume_url: string | null;
  interviewRounds?: InterviewRound[];
  jobseeker: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    location: string | null;
    education_level: string | null;
    work_experience_years: number | null;
    skills: string[] | null;
  };
}

const formatLabels: Record<string, string> = {
  onsite: "现场面试",
  video: "视频面试",
  phone: "电话面试",
  online: "在线笔试",
};

const statusConfig: Record<string, { label: string; color: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "待处理", color: "text-yellow-600", variant: "outline" },
  viewed: { label: "已查看", color: "text-blue-600", variant: "secondary" },
  shortlisted: { label: "已入选", color: "text-green-600", variant: "default" },
  interview: { label: "面试中", color: "text-purple-600", variant: "default" },
  hired: { label: "已录用", color: "text-green-600", variant: "default" },
  rejected: { label: "已拒绝", color: "text-destructive", variant: "destructive" },
};

export default function CompanyApplications() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  
  // Interview scheduling states
  const [interviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [interviewTitle, setInterviewTitle] = useState("");
  const [interviewDate, setInterviewDate] = useState<Date>();
  const [interviewInterviewer, setInterviewInterviewer] = useState("");
  const [interviewFormat, setInterviewFormat] = useState<string>("");
  const [interviewNotes, setInterviewNotes] = useState("");
  const [scheduling, setScheduling] = useState(false);
  
  // Interview scoring states
  const [scoringDialogOpen, setScoringDialogOpen] = useState(false);
  const [selectedRound, setSelectedRound] = useState<InterviewRound | null>(null);
  const [scoringAppId, setScoringAppId] = useState<string | null>(null);
  const [scoreValue, setScoreValue] = useState<number>(85);
  const [scoreComment, setScoreComment] = useState("");
  const [submittingScore, setSubmittingScore] = useState(false);

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchJobs();
      fetchApplications();
    }
  }, [companyId]);

  const fetchCompanyProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (data) {
        setCompanyId(data.id);
      }
    }
  };

  const fetchJobs = async () => {
    if (!companyId) return;

    const { data } = await supabase
      .from("jobs")
      .select("id, title")
      .eq("company_id", companyId);

    setJobs(data || []);
  };

  const fetchApplications = async () => {
    if (!companyId) return;
    setLoading(true);

    const { data: jobsData } = await supabase
      .from("jobs")
      .select("id, title")
      .eq("company_id", companyId);

    if (!jobsData || jobsData.length === 0) {
      setLoading(false);
      return;
    }

    const jobIds = jobsData.map((j) => j.id);
    const jobMap = Object.fromEntries(jobsData.map((j) => [j.id, j.title]));

    const { data: appsData, error } = await supabase
      .from("job_applications")
      .select(`
        id,
        job_id,
        status,
        applied_at,
        cover_letter,
        resume_url,
        jobseeker_profiles (
          id,
          full_name,
          email,
          phone,
          location,
          education_level,
          work_experience_years,
          skills
        )
      `)
      .in("job_id", jobIds)
      .order("applied_at", { ascending: false });

    if (error) {
      toast({
        title: "加载失败",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Fetch interview rounds for all applications
    const appIds = appsData?.map((a: any) => a.id) || [];
    const { data: interviewData } = await supabase
      .from("interview_rounds")
      .select("*")
      .in("application_id", appIds)
      .order("round", { ascending: true });

    const interviewMap = new Map<string, InterviewRound[]>();
    interviewData?.forEach((round: any) => {
      const appId = round.application_id;
      if (!interviewMap.has(appId)) {
        interviewMap.set(appId, []);
      }
      interviewMap.get(appId)!.push({
        id: round.id,
        round: round.round,
        title: round.title,
        interview_date: round.interview_date,
        interviewer: round.interviewer,
        interview_format: round.interview_format,
        score: round.score,
        notes: round.notes,
        status: round.status,
      });
    });

    setApplications(
      appsData?.map((app: any) => ({
        id: app.id,
        job_id: app.job_id,
        jobTitle: jobMap[app.job_id] || "未知职位",
        status: app.status,
        applied_at: app.applied_at,
        cover_letter: app.cover_letter,
        resume_url: app.resume_url,
        jobseeker: app.jobseeker_profiles,
        interviewRounds: interviewMap.get(app.id) || [],
      })) || []
    );
    setLoading(false);
  };

  const updateStatus = async (applicationId: string, newStatus: string) => {
    const { error } = await supabase
      .from("job_applications")
      .update({ status: newStatus })
      .eq("id", applicationId);

    if (error) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "状态已更新" });
      fetchApplications();
    }
  };

  const viewDetail = async (app: Application) => {
    setSelectedApplication(app);
    setDetailDialogOpen(true);

    // Mark as viewed if pending
    if (app.status === "pending") {
      await updateStatus(app.id, "viewed");
    }
  };

  const openInterviewDialog = (app: Application) => {
    setSelectedApplication(app);
    setInterviewTitle("");
    setInterviewDate(undefined);
    setInterviewInterviewer("");
    setInterviewFormat("");
    setInterviewNotes("");
    setInterviewDialogOpen(true);
  };

  const openScoringDialog = (app: Application, round: InterviewRound) => {
    setScoringAppId(app.id);
    setSelectedRound(round);
    setScoreValue(round.score || 85);
    setScoreComment(round.notes || "");
    setScoringDialogOpen(true);
  };

  const handleSubmitScore = async () => {
    if (!scoringAppId || !selectedRound) return;
    
    setSubmittingScore(true);
    
    const { error } = await supabase
      .from("interview_rounds")
      .update({ 
        score: scoreValue, 
        notes: scoreComment,
        status: "completed"
      })
      .eq("id", selectedRound.id);
    
    setSubmittingScore(false);
    
    if (error) {
      toast({
        title: "评分提交失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "评分已提交",
        description: `${selectedRound.title} 评分：${scoreValue}分`,
      });
      setScoringDialogOpen(false);
      fetchApplications();
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedApplication || !interviewTitle || !interviewDate || !interviewInterviewer || !interviewFormat) {
      toast({
        title: "请填写完整信息",
        description: "请填写面试题目、日期、面试人和面试形式",
        variant: "destructive",
      });
      return;
    }

    setScheduling(true);
    
    // Calculate the next round number
    const currentRounds = selectedApplication.interviewRounds || [];
    const nextRound = currentRounds.length + 1;

    // Insert the interview round
    const { error: roundError } = await supabase
      .from("interview_rounds")
      .insert({
        application_id: selectedApplication.id,
        round: nextRound,
        title: interviewTitle,
        interview_date: interviewDate.toISOString(),
        interviewer: interviewInterviewer,
        interview_format: interviewFormat,
        status: "scheduled",
      });

    if (roundError) {
      setScheduling(false);
      toast({
        title: "安排失败",
        description: roundError.message,
        variant: "destructive",
      });
      return;
    }

    // Update application status to interview if not already
    if (selectedApplication.status !== "interview") {
      await supabase
        .from("job_applications")
        .update({ status: "interview" })
        .eq("id", selectedApplication.id);
    }

    setScheduling(false);
    toast({ 
      title: "面试已安排",
      description: `已为 ${selectedApplication.jobseeker.full_name} 安排 ${interviewTitle}` 
    });
    setInterviewDialogOpen(false);
    setDetailDialogOpen(false);
    fetchApplications();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


  const filteredApplications = applications.filter((app) => {
    const jobMatch = selectedJob === "all" || app.job_id === selectedJob;
    const statusMatch = activeTab === "all" || app.status === activeTab;
    return jobMatch && statusMatch;
  });

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    viewed: applications.filter((a) => a.status === "viewed").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    interview: applications.filter((a) => a.status === "interview").length,
    hired: applications.filter((a) => a.status === "hired").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  if (loading) {
    return (
      <CompanyLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">收到的简历</h1>
            <p className="text-muted-foreground">管理求职者投递的简历</p>
          </div>

          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="选择职位" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部职位</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="pending">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="pending">
              待处理 ({statusCounts.pending})
            </TabsTrigger>
            <TabsTrigger value="shortlisted">
              已入选 ({statusCounts.shortlisted})
            </TabsTrigger>
            <TabsTrigger value="interview">
              面试中 ({statusCounts.interview})
            </TabsTrigger>
            <TabsTrigger value="hired">
              录取 ({statusCounts.hired})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredApplications.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">暂无简历</h3>
                <p className="text-muted-foreground">还没有收到符合条件的简历</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => {
                  const status = statusConfig[app.status] || statusConfig.pending;
                  return (
                    <Card key={app.id} className={cn("p-6", app.status === "interview" && "border-purple-200 dark:border-purple-800")}>
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Users className="w-6 h-6 text-primary" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold">{app.jobseeker.full_name}</h3>
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              应聘: {app.jobTitle}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              {app.jobseeker.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {app.jobseeker.location}
                                </span>
                              )}
                              {app.jobseeker.education_level && (
                                <span>{app.jobseeker.education_level}</span>
                              )}
                              {app.jobseeker.work_experience_years !== null && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {app.jobseeker.work_experience_years}年经验
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(app.applied_at)}
                            </span>
                            <Button variant="outline" size="sm" onClick={() => viewDetail(app)}>
                              <Eye className="w-4 h-4 mr-1" />
                              查看
                            </Button>
                            {app.status === "pending" && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => updateStatus(app.id, "shortlisted")}>
                                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                                    标记入选
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => updateStatus(app.id, "rejected")}>
                                    <XCircle className="w-4 h-4 mr-2 text-destructive" />
                                    拒绝
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>

                        {/* Action buttons for shortlisted status */}
                        {app.status === "shortlisted" && (
                          <div className="flex gap-3 pt-4 border-t border-dashed">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openInterviewDialog(app)}
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              安排面试
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => updateStatus(app.id, "rejected")}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              拒绝
                            </Button>
                          </div>
                        )}

                        {/* Interview Rounds Progress - Only for interview status */}
                        {app.status === "interview" && app.interviewRounds && (
                          <div className="border-t pt-4 mt-2">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm font-medium">面试进度</span>
                              <span className="text-xs text-muted-foreground">
                                ({app.interviewRounds.filter(r => r.score !== null).length}/{app.interviewRounds.length} 轮已完成)
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                              {[1, 2, 3, 4].map((roundNum) => {
                                const round = app.interviewRounds?.find(r => r.round === roundNum);
                                const isCompleted = round?.score !== null && round?.score !== undefined;
                                const isPending = round && round.score === null;
                                const isEmpty = !round;
                                
                                // Find the current round (first round without a score)
                                const currentRound = app.interviewRounds?.find(r => r.score === null);
                                const isCurrentRound = round && currentRound && round.round === currentRound.round;
                                
                                return (
                                  <div 
                                    key={roundNum}
                                    className={cn(
                                      "p-3 rounded-lg border text-sm",
                                      isCompleted && "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
                                      isPending && "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800",
                                      isEmpty && "bg-muted/30 border-dashed"
                                    )}
                                  >
                                    {round ? (
                                      <>
                                        <div className="flex items-center justify-between mb-1">
                                          <span className="font-medium text-xs">{round.title}</span>
                                          {isCompleted ? (
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                          ) : (
                                            <Clock className="w-4 h-4 text-purple-600" />
                                          )}
                                        </div>
                                        <div className="text-xs text-muted-foreground mb-1">
                                          {formatDate(round.interview_date)} · {round.interviewer}
                                        </div>
                                        <div className="text-xs text-muted-foreground mb-2">
                                          {formatLabels[round.interview_format] || round.interview_format}
                                        </div>
                                        {isCompleted && round.score && (
                                          <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div 
                                                  className={cn(
                                                    "h-full rounded-full transition-all",
                                                    round.score >= 90 ? "bg-green-500" : round.score >= 80 ? "bg-blue-500" : round.score >= 70 ? "bg-yellow-500" : "bg-red-500"
                                                  )}
                                                  style={{ width: `${round.score}%` }}
                                                />
                                              </div>
                                              <span className={cn(
                                                "text-xs font-bold",
                                                round.score >= 90 ? "text-green-600" : round.score >= 80 ? "text-blue-600" : round.score >= 70 ? "text-yellow-600" : "text-red-600"
                                              )}>
                                                {round.score}分
                                              </span>
                                            </div>
                                          </div>
                                        )}
                                        {isPending && isCurrentRound && (
                                          <div className="space-y-2">
                                            <Badge variant="outline" className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-0">
                                              待面试
                                            </Badge>
                                            <Button 
                                              size="sm" 
                                              variant="outline" 
                                              className="w-full h-6 text-xs"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                openScoringDialog(app, round);
                                              }}
                                            >
                                              录入评分
                                            </Button>
                                          </div>
                                        )}
                                        {isPending && !isCurrentRound && (
                                          <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-0">
                                            等待上一轮完成
                                          </Badge>
                                        )}
                                      </>
                                    ) : (
                                      <div className="text-center text-muted-foreground py-2">
                                        <span className="text-xs">第{roundNum}轮</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Action buttons for interview status */}
                            <div className="flex gap-3 mt-4 pt-3 border-t border-dashed">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => openInterviewDialog(app)}
                              >
                                <Calendar className="w-4 h-4 mr-2" />
                                安排下一轮面试
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => updateStatus(app.id, "hired")}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                录取
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => updateStatus(app.id, "rejected")}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                拒绝
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>简历详情</DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedApplication.jobseeker.full_name}</h3>
                  <p className="text-muted-foreground">应聘: {selectedApplication.jobTitle}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {selectedApplication.jobseeker.email}
                    </span>
                    {selectedApplication.jobseeker.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {selectedApplication.jobseeker.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">所在地</p>
                  <p className="font-medium">{selectedApplication.jobseeker.location || "未填写"}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">学历</p>
                  <p className="font-medium">{selectedApplication.jobseeker.education_level || "未填写"}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">工作经验</p>
                  <p className="font-medium">
                    {selectedApplication.jobseeker.work_experience_years !== null
                      ? `${selectedApplication.jobseeker.work_experience_years}年`
                      : "未填写"}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/50">
                  <p className="text-sm text-muted-foreground">投递时间</p>
                  <p className="font-medium">{formatDate(selectedApplication.applied_at)}</p>
                </div>
              </div>

              {/* Skills */}
              {selectedApplication.jobseeker.skills && selectedApplication.jobseeker.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">技能</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.jobseeker.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Cover Letter */}
              {selectedApplication.cover_letter && (
                <div>
                  <h4 className="font-semibold mb-2">求职备注</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedApplication.cover_letter}
                  </p>
                </div>
              )}

              {/* Resume */}
              {selectedApplication.resume_url && (
                <div>
                  <h4 className="font-semibold mb-2">简历附件</h4>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    下载简历
                  </Button>
                </div>
              )}

              {/* Actions */}
              {(selectedApplication.status === "pending" || selectedApplication.status === "shortlisted") && (
                <div className="flex gap-3 pt-4 border-t">
                  {selectedApplication.status === "pending" && (
                    <Button
                      className="flex-1"
                      onClick={() => {
                        updateStatus(selectedApplication.id, "shortlisted");
                        setDetailDialogOpen(false);
                      }}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      标记入选
                    </Button>
                  )}
                  {selectedApplication.status === "shortlisted" && (
                    <Button
                      className="flex-1"
                      onClick={() => {
                        setDetailDialogOpen(false);
                        openInterviewDialog(selectedApplication);
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      安排面试
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    onClick={() => {
                      updateStatus(selectedApplication.id, "rejected");
                      setDetailDialogOpen(false);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    拒绝
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Interview Scheduling Dialog */}
      <Dialog open={interviewDialogOpen} onOpenChange={setInterviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>安排面试</DialogTitle>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{selectedApplication.jobseeker.full_name}</p>
                  <p className="text-sm text-muted-foreground">应聘: {selectedApplication.jobTitle}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interviewTitle">面试题目 *</Label>
                <Input
                  id="interviewTitle"
                  placeholder="例如：二面-业务经理面试"
                  value={interviewTitle}
                  onChange={(e) => setInterviewTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>面试日期 *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !interviewDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {interviewDate ? format(interviewDate, "yyyy年MM月dd日", { locale: zhCN }) : "选择面试日期"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={interviewDate}
                      onSelect={setInterviewDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interviewInterviewer">面试人 *</Label>
                <Input
                  id="interviewInterviewer"
                  placeholder="例如：王经理"
                  value={interviewInterviewer}
                  onChange={(e) => setInterviewInterviewer(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>面试形式 *</Label>
                <Select value={interviewFormat} onValueChange={setInterviewFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择面试形式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onsite">现场面试</SelectItem>
                    <SelectItem value="video">视频面试</SelectItem>
                    <SelectItem value="phone">电话面试</SelectItem>
                    <SelectItem value="online">在线笔试</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interviewNotes">备注（可选）</Label>
                <Textarea
                  id="interviewNotes"
                  placeholder="添加面试相关备注，如面试地点、面试官信息等..."
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setInterviewDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleScheduleInterview} disabled={scheduling}>
              {scheduling && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              确认安排
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Interview Scoring Dialog */}
      <Dialog open={scoringDialogOpen} onOpenChange={setScoringDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>面试评分</DialogTitle>
          </DialogHeader>

          {selectedRound && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="font-medium">{selectedRound.title}</p>
                <p className="text-sm text-muted-foreground">
                  面试官：{selectedRound.interviewer} · {formatDate(selectedRound.interview_date)}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>面试评分（百分制）</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={scoreValue}
                      onChange={(e) => setScoreValue(Number(e.target.value))}
                      className="flex-1 h-2 bg-muted rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                    />
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={scoreValue}
                      onChange={(e) => setScoreValue(Math.min(100, Math.max(0, Number(e.target.value))))}
                      className="w-20 text-center"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span className={cn(
                      "font-bold text-sm",
                      scoreValue >= 90 ? "text-green-600" : scoreValue >= 80 ? "text-blue-600" : scoreValue >= 70 ? "text-yellow-600" : "text-red-600"
                    )}>
                      {scoreValue >= 90 ? "优秀" : scoreValue >= 80 ? "良好" : scoreValue >= 70 ? "合格" : "不合格"}
                    </span>
                    <span>100</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scoreComment">面试评语</Label>
                  <Textarea
                    id="scoreComment"
                    placeholder="请输入面试评语和反馈..."
                    value={scoreComment}
                    onChange={(e) => setScoreComment(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setScoringDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitScore} disabled={submittingScore}>
              {submittingScore && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              提交评分
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CompanyLayout>
  );
}
