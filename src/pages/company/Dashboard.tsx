import { useState, useEffect } from "react";
import { CompanyLayout } from "@/components/layout/CompanyLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Users,
  FileText,
  Eye,
  TrendingUp,
  TrendingDown,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

// Mock data for charts
const applicationTrendData = [
  { date: "12/01", applications: 12, views: 45 },
  { date: "12/02", applications: 19, views: 52 },
  { date: "12/03", applications: 15, views: 48 },
  { date: "12/04", applications: 25, views: 71 },
  { date: "12/05", applications: 32, views: 89 },
  { date: "12/06", applications: 28, views: 76 },
  { date: "12/07", applications: 35, views: 95 },
];

const applicationStatusData = [
  { name: "待处理", value: 45, color: "hsl(var(--primary))" },
  { name: "已查看", value: 30, color: "hsl(var(--accent))" },
  { name: "已面试", value: 15, color: "hsl(210, 100%, 50%)" },
  { name: "已录用", value: 8, color: "hsl(142, 76%, 36%)" },
  { name: "已拒绝", value: 12, color: "hsl(var(--destructive))" },
];

const jobPerformanceData = [
  { job: "前端开发", applications: 45, views: 320 },
  { job: "后端开发", applications: 38, views: 280 },
  { job: "产品经理", applications: 28, views: 210 },
  { job: "UI设计师", applications: 22, views: 180 },
  { job: "数据分析", applications: 18, views: 150 },
];

const weeklyActivityData = [
  { day: "周一", applications: 8, invitations: 3 },
  { day: "周二", applications: 12, invitations: 5 },
  { day: "周三", applications: 15, invitations: 4 },
  { day: "周四", applications: 10, invitations: 6 },
  { day: "周五", applications: 18, invitations: 8 },
  { day: "周六", applications: 5, invitations: 2 },
  { day: "周日", applications: 3, invitations: 1 },
];

interface Stats {
  totalJobs: number;
  openJobs: number;
  totalApplications: number;
  pendingApplications: number;
  totalViews: number;
  totalInvitations: number;
}

interface RecentApplication {
  id: string;
  jobTitle: string;
  applicantName: string;
  appliedAt: string;
  status: string;
}

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalJobs: 0,
    openJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalViews: 0,
    totalInvitations: 0,
  });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchStats();
      fetchRecentApplications();
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

  const fetchStats = async () => {
    if (!companyId) return;

    // Fetch jobs
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, status, views_count")
      .eq("company_id", companyId);

    const jobIds = jobs?.map((j) => j.id) || [];

    // Fetch applications
    const { data: applications } = await supabase
      .from("job_applications")
      .select("id, status")
      .in("job_id", jobIds.length > 0 ? jobIds : ["00000000-0000-0000-0000-000000000000"]);

    // Fetch invitations
    const { data: invitations } = await supabase
      .from("job_invitations")
      .select("id")
      .eq("company_id", companyId);

    setStats({
      totalJobs: jobs?.length || 0,
      openJobs: jobs?.filter((j) => j.status === "open").length || 0,
      totalApplications: applications?.length || 0,
      pendingApplications: applications?.filter((a) => a.status === "pending").length || 0,
      totalViews: jobs?.reduce((sum, j) => sum + (j.views_count || 0), 0) || 0,
      totalInvitations: invitations?.length || 0,
    });
  };

  const fetchRecentApplications = async () => {
    if (!companyId) return;

    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, title")
      .eq("company_id", companyId);

    if (!jobs || jobs.length === 0) return;

    const jobIds = jobs.map((j) => j.id);
    const jobMap = Object.fromEntries(jobs.map((j) => [j.id, j.title]));

    const { data: applications } = await supabase
      .from("job_applications")
      .select(`
        id,
        job_id,
        applied_at,
        status,
        jobseeker_profiles (
          full_name
        )
      `)
      .in("job_id", jobIds)
      .order("applied_at", { ascending: false })
      .limit(5);

    if (applications) {
      setRecentApplications(
        applications.map((app: any) => ({
          id: app.id,
          jobTitle: jobMap[app.job_id] || "未知职位",
          applicantName: app.jobseeker_profiles?.full_name || "未知求职者",
          appliedAt: app.applied_at,
          status: app.status,
        }))
      );
    }
  };

  const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "待处理", color: "text-yellow-600", icon: Clock },
    viewed: { label: "已查看", color: "text-blue-600", icon: Eye },
    shortlisted: { label: "已入选", color: "text-green-600", icon: CheckCircle2 },
    rejected: { label: "已拒绝", color: "text-destructive", icon: XCircle },
    interview: { label: "面试中", color: "text-purple-600", icon: Users },
    hired: { label: "已录用", color: "text-green-600", icon: CheckCircle2 },
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "今天";
    if (days === 1) return "昨天";
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString("zh-CN");
  };

  const statCards = [
    {
      title: "发布职位",
      value: stats.totalJobs,
      subValue: `${stats.openJobs} 个招聘中`,
      icon: Briefcase,
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "收到简历",
      value: stats.totalApplications,
      subValue: `${stats.pendingApplications} 个待处理`,
      icon: FileText,
      color: "text-accent",
      bgColor: "bg-accent/10",
      trend: "+28%",
      trendUp: true,
    },
    {
      title: "职位浏览",
      value: stats.totalViews,
      subValue: "总浏览量",
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-600/10",
      trend: "+15%",
      trendUp: true,
    },
    {
      title: "发送邀请",
      value: stats.totalInvitations,
      subValue: "已发送邀请",
      icon: Send,
      color: "text-green-600",
      bgColor: "bg-green-600/10",
      trend: "+8%",
      trendUp: true,
    },
  ];

  return (
    <CompanyLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">数据概览</h1>
            <p className="text-muted-foreground">查看您的招聘数据和统计信息</p>
          </div>
          <Button onClick={() => navigate("/company/jobs/new")}>
            <Plus className="w-4 h-4 mr-2" />
            发布新职位
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.trendUp ? "text-green-600" : "text-destructive"}`}>
                  {stat.trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.trend}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.subValue}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{stat.title}</p>
            </Card>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Application Trend */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">简历投递趋势</h3>
              <select className="text-sm border rounded-lg px-3 py-1.5 bg-background">
                <option>近7天</option>
                <option>近30天</option>
                <option>近90天</option>
              </select>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={applicationTrendData}>
                  <defs>
                    <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorApplications)"
                    name="投递数"
                  />
                  <Area
                    type="monotone"
                    dataKey="views"
                    stroke="hsl(var(--accent))"
                    fillOpacity={1}
                    fill="url(#colorViews)"
                    name="浏览数"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Application Status Pie */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-6">简历处理状态</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {applicationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Job Performance */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-6">职位表现</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobPerformanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis
                    dataKey="job"
                    type="category"
                    width={80}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="applications" fill="hsl(var(--primary))" name="投递数" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Weekly Activity */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-6">本周活动</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                    name="收到简历"
                  />
                  <Line
                    type="monotone"
                    dataKey="invitations"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--accent))" }}
                    name="发送邀请"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg">最新简历</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/company/applications")}>
              查看全部
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {recentApplications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>暂无收到的简历</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((app) => {
                const status = statusLabels[app.status] || statusLabels.pending;
                const StatusIcon = status.icon;
                return (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{app.applicantName}</p>
                        <p className="text-sm text-muted-foreground">
                          应聘 {app.jobTitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`flex items-center gap-1 text-sm ${status.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(app.appliedAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </CompanyLayout>
  );
}
