import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CompanyLayout } from "@/components/layout/CompanyLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Clock,
  Eye,
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
  Pause,
  Play,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Job {
  id: string;
  title: string;
  location: string;
  job_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  status: string;
  views_count: number | null;
  created_at: string;
  application_count?: number;
}

const jobTypeLabels: Record<string, string> = {
  "full-time": "全职",
  "part-time": "兼职",
  contract: "合同工",
  internship: "实习",
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  open: { label: "招聘中", variant: "default" },
  closed: { label: "已关闭", variant: "secondary" },
  paused: { label: "已暂停", variant: "destructive" },
};

export default function CompanyJobs() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchJobs();
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
    setLoading(false);
  };

  const fetchJobs = async () => {
    if (!companyId) return;

    const { data: jobsData, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "加载失败",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Fetch application counts
    const jobIds = jobsData?.map((j) => j.id) || [];
    const { data: applications } = await supabase
      .from("job_applications")
      .select("job_id")
      .in("job_id", jobIds.length > 0 ? jobIds : ["00000000-0000-0000-0000-000000000000"]);

    const applicationCounts = applications?.reduce((acc: Record<string, number>, app) => {
      acc[app.job_id] = (acc[app.job_id] || 0) + 1;
      return acc;
    }, {}) || {};

    setJobs(
      jobsData?.map((job) => ({
        ...job,
        application_count: applicationCounts[job.id] || 0,
      })) || []
    );
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    const { error } = await supabase
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId);

    if (error) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "状态已更新" });
      fetchJobs();
    }
  };

  const confirmDelete = (job: Job) => {
    setJobToDelete(job);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;

    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", jobToDelete.id);

    if (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "职位已删除" });
      fetchJobs();
    }
    setDeleteDialogOpen(false);
    setJobToDelete(null);
  };

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "面议";
    if (min && max) return `${min / 1000}K-${max / 1000}K`;
    if (min) return `${min / 1000}K起`;
    return `最高${max! / 1000}K`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN");
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
            <h1 className="text-2xl font-bold mb-1">职位管理</h1>
            <p className="text-muted-foreground">管理您发布的所有招聘职位</p>
          </div>
          <Button onClick={() => navigate("/company/jobs/new")}>
            <Plus className="w-4 h-4 mr-2" />
            发布新职位
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="搜索职位..."
            className="pl-10"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">{jobs.length}</p>
            <p className="text-sm text-muted-foreground">全部职位</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {jobs.filter((j) => j.status === "open").length}
            </p>
            <p className="text-sm text-muted-foreground">招聘中</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {jobs.filter((j) => j.status === "paused").length}
            </p>
            <p className="text-sm text-muted-foreground">已暂停</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">
              {jobs.filter((j) => j.status === "closed").length}
            </p>
            <p className="text-sm text-muted-foreground">已关闭</p>
          </Card>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <Card className="p-12 text-center">
            <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">
              {jobs.length === 0 ? "暂无职位" : "没有找到匹配的职位"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {jobs.length === 0 ? "发布您的第一个招聘职位" : "尝试其他搜索关键词"}
            </p>
            {jobs.length === 0 && (
              <Button onClick={() => navigate("/company/jobs/new")}>
                <Plus className="w-4 h-4 mr-2" />
                发布职位
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const status = statusLabels[job.status] || statusLabels.open;
              return (
                <Card key={job.id} className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        {job.job_type && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {jobTypeLabels[job.job_type] || job.job_type}
                          </span>
                        )}
                        <span className="font-medium text-primary">
                          {formatSalary(job.salary_min, job.salary_max)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          {job.views_count || 0}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          {job.application_count || 0}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(job.created_at)}
                      </span>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/company/jobs/${job.id}/edit`)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            编辑
                          </DropdownMenuItem>
                          {job.status === "open" ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(job.id, "paused")}>
                              <Pause className="w-4 h-4 mr-2" />
                              暂停招聘
                            </DropdownMenuItem>
                          ) : job.status === "paused" ? (
                            <DropdownMenuItem onClick={() => handleStatusChange(job.id, "open")}>
                              <Play className="w-4 h-4 mr-2" />
                              恢复招聘
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem onClick={() => handleStatusChange(job.id, "closed")}>
                            <Clock className="w-4 h-4 mr-2" />
                            关闭职位
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => confirmDelete(job)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除职位 "{jobToDelete?.title}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CompanyLayout>
  );
}
