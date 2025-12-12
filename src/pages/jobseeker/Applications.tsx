import { useState, useEffect } from "react";
import { JobseekerLayout } from "@/components/layout/JobseekerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Eye,
  MessageSquare,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Application {
  id: string;
  applied_at: string;
  status: string;
  updated_at: string;
  cover_letter: string | null;
  jobs: {
    id: string;
    title: string;
    location: string;
    salary_min: number | null;
    salary_max: number | null;
    company_profiles: {
      company_name: string;
      logo_url: string | null;
    } | null;
  } | null;
}

const statusConfig: Record<string, { label: string; className: string; description: string }> = {
  pending: {
    label: "待查看",
    className: "bg-muted text-muted-foreground",
    description: "简历已投递，等待企业查看",
  },
  viewed: {
    label: "已查看",
    className: "bg-primary/10 text-primary",
    description: "企业已查看您的简历",
  },
  shortlisted: {
    label: "已入选",
    className: "bg-accent/10 text-accent",
    description: "恭喜！您已进入候选名单",
  },
  interview: {
    label: "面试中",
    className: "bg-warning/10 text-warning",
    description: "已安排面试",
  },
  rejected: {
    label: "未通过",
    className: "bg-destructive/10 text-destructive",
    description: "很遗憾，您未通过筛选",
  },
  hired: {
    label: "已录用",
    className: "bg-success/10 text-success",
    description: "恭喜！您已被录用",
  },
};

export default function JobseekerApplications() {
  const [activeTab, setActiveTab] = useState("all");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("jobseeker_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!profile) return;

      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          id,
          applied_at,
          status,
          updated_at,
          cover_letter,
          jobs (
            id,
            title,
            location,
            salary_min,
            salary_max,
            company_profiles (
              company_name,
              logo_url
            )
          )
        `)
        .eq("jobseeker_id", profile.id)
        .order("applied_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = activeTab === "all"
    ? applications
    : applications.filter((app) => app.status === activeTab);

  const getStatusCounts = () => {
    const counts: Record<string, number> = { all: applications.length };
    applications.forEach((app) => {
      counts[app.status || "pending"] = (counts[app.status || "pending"] || 0) + 1;
    });
    return counts;
  };

  const counts = getStatusCounts();

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "面议";
    if (min && max) return `${min / 1000}K-${max / 1000}K`;
    if (min) return `${min / 1000}K起`;
    return `${max! / 1000}K`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN");
  };

  if (loading) {
    return (
      <JobseekerLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </JobseekerLayout>
    );
  }

  return (
    <JobseekerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">我的投递</h1>
          <p className="text-muted-foreground">
            跟踪您的所有投递记录和进度
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { key: "all", label: "全部" },
            { key: "pending", label: "待查看" },
            { key: "viewed", label: "已查看" },
            { key: "shortlisted", label: "已入选" },
            { key: "interview", label: "面试中" },
            { key: "hired", label: "已录用" },
          ].map((item) => (
            <Card
              key={item.key}
              className={`p-4 cursor-pointer transition-all ${
                activeTab === item.key
                  ? "ring-2 ring-primary shadow-md"
                  : "hover:shadow-md"
              }`}
              onClick={() => setActiveTab(item.key)}
            >
              <p className="text-2xl font-bold mb-1">{counts[item.key] || 0}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </Card>
          ))}
        </div>

        {/* Applications List */}
        <Card className="p-6">
          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">暂无投递记录</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                >
                  {/* Company Logo */}
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    {app.jobs?.company_profiles?.logo_url ? (
                      <img 
                        src={app.jobs.company_profiles.logo_url} 
                        alt=""
                        className="w-full h-full rounded-xl object-cover"
                      />
                    ) : (
                      <Building2 className="w-7 h-7 text-muted-foreground" />
                    )}
                  </div>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{app.jobs?.title || "未知职位"}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          statusConfig[app.status || "pending"]?.className || statusConfig.pending.className
                        }`}
                      >
                        {statusConfig[app.status || "pending"]?.label || "待查看"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {app.jobs?.company_profiles?.company_name || "未知企业"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {app.jobs?.location || "未知地点"}
                      </span>
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <DollarSign className="w-4 h-4" />
                        {formatSalary(app.jobs?.salary_min || null, app.jobs?.salary_max || null)}
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        投递于 {formatDate(app.applied_at)}
                      </span>
                    </div>

                    {/* Status specific info */}
                    {app.status === "viewed" && (
                      <div className="mt-2 text-sm text-primary flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        企业已查看您的简历
                      </div>
                    )}
                    {app.status === "interview" && (
                      <div className="mt-2 text-sm text-warning flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        已安排面试，请保持电话畅通
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm">
                      查看详情
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </JobseekerLayout>
  );
}
