import { UpcomingEventsTimeline } from "@/components/jobseeker/UpcomingEventsTimeline";
import { JobseekerLayout } from "@/components/layout/JobseekerLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress"; // 假设你有名为 Progress 的组件，或者可以直接用 div 模拟
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Bookmark, Building2, Clock, Eye, Mail, MapPin, Send, TrendingUp, Sparkles, CheckCircle2, Briefcase, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface RecentApplication {
  id: string;
  applied_at: string;
  status: string | null;
  jobs: {
    title: string;
    location: string;
    company_profiles: {
      company_name: string;
    } | null;
  } | null;
}

interface RecentInvitation {
  id: string;
  message: string | null;
  created_at: string;
  status: string | null;
  company_profiles: {
    company_name: string;
  } | null;
  jobs: {
    title: string;
  } | null;
}

interface RecommendedJob {
  id: string;
  title: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  company_profiles: {
    company_name: string;
  } | null;
}

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: "待查看", className: "bg-muted text-muted-foreground" },
  viewed: { label: "已查看", className: "bg-primary/10 text-primary" },
  shortlisted: { label: "已入选", className: "bg-accent/10 text-accent" },
  interview: { label: "面试中", className: "bg-warning/10 text-warning" },
  rejected: { label: "未通过", className: "bg-destructive/10 text-destructive" },
  hired: { label: "已录用", className: "bg-success/10 text-success" }
};

export default function JobseekerDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    applications: 0,
    invitations: 0,
    profileViews: 0,
    bookmarks: 0
  });
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [recentInvitations, setRecentInvitations] = useState<RecentInvitation[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<RecommendedJob[]>([]);
  const [jobseekerId, setJobseekerId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Fetch profile
    const { data: profileData } = await supabase
      .from("jobseeker_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData);
      setJobseekerId(profileData.id);
      calculateProfileCompletion(profileData);

      // Fetch stats
      await fetchStats(profileData.id);

      // Fetch recent applications
      await fetchRecentApplications(profileData.id);

      // Fetch recent invitations
      await fetchRecentInvitations(profileData.id);
    }

    // Fetch recommended jobs
    await fetchRecommendedJobs();
  };

  const fetchStats = async (profileId: string) => {
    // Get applications count
    const { count: appCount } = await supabase
      .from("job_applications")
      .select("*", { count: "exact", head: true })
      .eq("jobseeker_id", profileId);

    // Get invitations count
    const { count: invCount } = await supabase
      .from("job_invitations")
      .select("*", { count: "exact", head: true })
      .eq("jobseeker_id", profileId);

    // Get bookmarks count
    const { count: bookmarkCount } = await supabase
      .from("job_bookmarks")
      .select("*", { count: "exact", head: true })
      .eq("jobseeker_id", profileId);

    setStats({
      applications: appCount || 0,
      invitations: invCount || 0,
      // 目前后端还没有“被查看次数”的真实统计字段，这里先固定为 0，避免误导
      profileViews: 0,
      bookmarks: bookmarkCount || 0
    });
  };

  const statCards = [
    {
      label: "已投递",
      value: stats.applications,
      icon: Send,
      gradient: "from-primary/20 to-primary/5",
      iconBg: "bg-primary/15",
      iconColor: "text-primary",
      link: "/jobseeker/applications",
    },
    {
      label: "收到邀约",
      value: stats.invitations,
      icon: Mail,
      gradient: "from-accent/20 to-accent/5",
      iconBg: "bg-accent/15",
      iconColor: "text-accent",
      link: "/jobseeker/invitations",
    },
    {
      label: "被查看",
      value: stats.profileViews,
      icon: Eye,
      gradient: "from-warning/20 to-warning/5",
      iconBg: "bg-warning/15",
      iconColor: "text-warning",
      link: "/jobseeker/resume",
    },
    {
      label: "已收藏",
      value: stats.bookmarks,
      icon: Bookmark,
      gradient: "from-success/20 to-success/5",
      iconBg: "bg-success/15",
      iconColor: "text-success",
      link: "/jobseeker/bookmarks",
    },
  ];


  const fetchRecentApplications = async (profileId: string) => {
    const { data } = await supabase
      .from("job_applications")
      .select(`
        id,
        applied_at,
        status,
        jobs (
          title,
          location,
          company_profiles (
            company_name
          )
        )
      `)
      .eq("jobseeker_id", profileId)
      .order("applied_at", { ascending: false })
      .limit(3);

    setRecentApplications(data || []);
  };

  const fetchRecentInvitations = async (profileId: string) => {
    const { data } = await supabase
      .from("job_invitations")
      .select(`
        id,
        message,
        created_at,
        status,
        company_profiles (
          company_name
        ),
        jobs (
          title
        )
      `)
      .eq("jobseeker_id", profileId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(2);

    setRecentInvitations(data || []);
  };

  const fetchRecommendedJobs = async () => {
    const { data } = await supabase
      .from("jobs")
      .select(`
        id,
        title,
        location,
        salary_min,
        salary_max,
        company_profiles (
          company_name
        )
      `)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(3);

    setRecommendedJobs(data || []);
  };

  const calculateProfileCompletion = (data: any) => {
    const fields = ["full_name", "phone", "location", "education_level", "bio", "skills", "resume_url"];
    const filledFields = fields.filter(field => data[field] && (Array.isArray(data[field]) ? data[field].length > 0 : true));
    setProfileCompletion(Math.round(filledFields.length / fields.length * 100));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN");
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "面议";
    if (min && max) return `${min / 1000}K-${max / 1000}K`;
    if (min) return `${min / 1000}K起`;
    return `${max! / 1000}K`;
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    await supabase
      .from("job_invitations")
      .update({ status: "accepted", responded_at: new Date().toISOString() })
      .eq("id", invitationId);

    setRecentInvitations(prev => prev.filter(inv => inv.id !== invitationId));
  };

  const handleRejectInvitation = async (invitationId: string) => {
    await supabase
      .from("job_invitations")
      .update({ status: "rejected", responded_at: new Date().toISOString() })
      .eq("id", invitationId);

    setRecentInvitations(prev => prev.filter(inv => inv.id !== invitationId));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return "凌晨好";
    if (hour < 12) return "上午好";
    if (hour < 14) return "中午好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  return (
      <JobseekerLayout>
        <div className="mx-auto max-w-7xl space-y-8 pb-12">
          {/* Hero Section */}
          <section
              className="animate-fade-in relative overflow-hidden rounded-3xl bg-gradient-hero p-8 shadow-large md:p-12"
              style={{ animationDelay: "0ms" }}
          >
            {/* Background decoration */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />
              <div className="absolute right-1/4 top-1/2 h-40 w-40 rounded-full bg-primary/5 blur-2xl" />
            </div>

            <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              {/* Welcome content */}
              <div className="max-w-2xl space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-md">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                  智能求职助手已上线
                </span>
                </div>

                <h1 className="font-display text-4xl font-black leading-tight tracking-tight md:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {getGreeting()}，
                </span>
                  <br />
                  <span>{profile?.full_name || "求职者"}</span>
                </h1>

                <p className="text-lg font-light leading-relaxed md:text-xl">
                  今天又是充满机遇的一天。我们为您推荐了
                  <span className="mx-2 text-2xl font-bold ">
                  {recommendedJobs.length}
                </span>
                  个匹配的新职位。
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                      size="lg"
                      className="gap-2 rounded-xl bg-primary font-semibold shadow-lg transition-all hover:shadow-glow"
                      asChild
                  >
                    <Link to="/jobseeker/search">
                      <Briefcase className="h-5 w-5" />
                      浏览职位
                    </Link>
                  </Button>
                  <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 rounded-xl border-primary-foreground/20 bg-primary-foreground/5 font-semibold backdrop-blur-sm hover:bg-primary-foreground/10"
                      asChild
                  >
                    <Link to="/jobseeker/profile">
                      完善资料
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Profile completion card */}
              {profileCompletion < 100 && (
                  <Card className="w-full max-w-sm border-primary-foreground/10 bg-primary-foreground/5 p-6 shadow-xl backdrop-blur-xl lg:w-80">
                    <div className="mb-4 flex items-end justify-between">
                      <div>
                        <p className="text-sm font-medium ">档案完善度</p>
                        <p className="text-3xl font-black ">{profileCompletion}%</p>
                      </div>
                      <CheckCircle2
                          className={`h-8 w-8 ${
                              profileCompletion > 70 ? "text-success" : "text-primary"
                          }`}
                      />
                    </div>

                    <div className="mb-6 h-2.5 w-full overflow-hidden rounded-full bg-primary-foreground/20">
                      <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                          style={{ width: `${profileCompletion}%` }}
                      />
                    </div>

                    <Button
                        className="w-full rounded-xl bg-primary-foreground font-semibold text-foreground hover:bg-primary-foreground/90"
                        asChild
                    >
                      <Link to="/jobseeker/profile">立即完善资料</Link>
                    </Button>
                  </Card>
              )}
            </div>
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
            {statCards.map((stat, i) => (
                <Link
                    key={stat.label}
                    to={stat.link}
                    className="group animate-fade-in-up"
                    style={{ animationDelay: `${100 + i * 50}ms` }}
                >
                  <Card
                      className={`relative overflow-hidden border-0 bg-gradient-to-br ${stat.gradient} p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-medium md:p-6`}
                  >
                    <div className="flex flex-col gap-4">
                      <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconBg} transition-transform duration-300 group-hover:scale-110 md:h-14 md:w-14`}
                      >
                        <stat.icon className={`h-6 w-6 ${stat.iconColor} md:h-7 md:w-7`} />
                      </div>
                      <div>
                        <p className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
                          {stat.value}
                        </p>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>

                    {/* Hover arrow */}
                    <ArrowRight className="absolute bottom-4 right-4 h-5 w-5 text-muted-foreground/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-foreground/50" />
                  </Card>
                </Link>
            ))}
          </section>

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
            {/* Left Column */}
            <div className="space-y-8 xl:col-span-2">
              {/* Timeline */}
              <section
                  className="animate-fade-in"
                  style={{ animationDelay: "300ms" }}
              >
                <div className="mb-4 flex items-center gap-2 px-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">日程安排</h2>
                </div>
                <UpcomingEventsTimeline />
              </section>

              {/* Recent Activity Grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Recent Applications */}
                <Card
                    className="animate-fade-in overflow-hidden border-0 shadow-medium"
                    style={{ animationDelay: "400ms" }}
                >
                  <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-muted/50 to-transparent p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                        <Send className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground">最近投递</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="group gap-1 font-semibold text-primary hover:bg-primary/5"
                        asChild
                    >
                      <Link to="/jobseeker/applications">
                        查看全部
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>

                  <div className="space-y-3 p-4">
                    {recentApplications.length === 0 ? (
                        <div className="py-12 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <Send className="h-7 w-7 text-muted-foreground" />
                          </div>
                          <p className="italic text-muted-foreground">暂无投递记录</p>
                        </div>
                    ) : (
                        recentApplications.map((app) => (
                            <div
                                key={app.id}
                                className="group relative flex gap-4 rounded-2xl border border-border/50 bg-background p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-soft"
                            >
                              <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
                                <Building2 className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-start justify-between gap-2">
                                  <h4 className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                                    {app.jobs?.title || "未知职位"}
                                  </h4>
                                  <span
                                      className={`flex-shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                          statusLabels[app.status || "pending"]?.className
                                      }`}
                                  >
                              {statusLabels[app.status || "pending"]?.label}
                            </span>
                                </div>

                                <p className="mb-2 text-sm font-medium text-muted-foreground">
                                  {app.jobs?.company_profiles?.company_name || "未知企业"}
                                </p>

                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {app.jobs?.location || "远程"}
                            </span>
                                  <span className="ml-auto flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                                    {formatDate(app.applied_at)}
                            </span>
                                </div>
                              </div>
                            </div>
                        ))
                    )}
                  </div>
                </Card>

                {/* Recent Invitations */}
                <Card
                    className="animate-fade-in overflow-hidden border-0 shadow-medium"
                    style={{ animationDelay: "500ms" }}
                >
                  <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-accent/10 to-transparent p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/15">
                        <Mail className="h-4 w-4 text-accent" />
                      </div>
                      <h3 className="font-bold text-foreground">企业邀约</h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="group gap-1 font-semibold text-accent hover:bg-accent/5"
                        asChild
                    >
                      <Link to="/jobseeker/invitations">
                        更多
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>

                  <div className="space-y-3 p-4">
                    {recentInvitations.length === 0 ? (
                        <div className="py-12 text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <Mail className="h-7 w-7 text-muted-foreground" />
                          </div>
                          <p className="italic text-muted-foreground">暂无待处理邀约</p>
                        </div>
                    ) : (
                        recentInvitations.map((inv) => (
                            <div
                                key={inv.id}
                                className="relative rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-5 shadow-soft"
                            >
                              <div className="mb-3">
                                <h4 className="font-bold text-foreground">
                                  {inv.company_profiles?.company_name}
                                </h4>
                                <p className="text-sm font-semibold text-accent">{inv.jobs?.title}</p>
                              </div>
                              <p className="mb-4 line-clamp-2 text-sm italic text-muted-foreground">
                                "{inv.message || "我们对您的简历很感兴趣..."}"
                              </p>
                              <div className="flex gap-3">
                                <Button
                                    size="sm"
                                    className="flex-1 rounded-xl shadow-sm"
                                    onClick={() => handleAcceptInvitation(inv.id)}
                                >
                                  接受邀约
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex-1 rounded-xl"
                                    onClick={() => handleRejectInvitation(inv.id)}
                                >
                                  婉拒
                                </Button>
                              </div>
                            </div>
                        ))
                    )}
                  </div>
                </Card>
              </div>
            </div>

            {/* Right Column - Recommended Jobs */}
            <div
                className="animate-slide-in-right space-y-6"
                style={{ animationDelay: "600ms" }}
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
                    <TrendingUp className="h-4 w-4 text-warning" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">热门推荐</h3>
                </div>
                <Link
                    to="/jobseeker/search"
                    className="text-sm font-medium text-primary transition-colors hover:underline"
                >
                  查看更多
                </Link>
              </div>

              <div className="space-y-4">
                {recommendedJobs.map((job, index) => (
                    <Card
                        key={job.id}
                        className="group relative overflow-hidden border-0 p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-medium"
                        style={{ animationDelay: `${700 + index * 100}ms` }}
                    >
                      {/* Decorative circle */}
                      <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />

                      <div className="relative z-10">
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <h4 className="font-bold text-foreground transition-colors group-hover:text-primary">
                            {job.title}
                          </h4>
                          <Star className="h-4 w-4 flex-shrink-0 text-muted-foreground/30 transition-colors group-hover:text-warning" />
                        </div>
                        <p className="mb-4 text-sm font-medium text-muted-foreground">
                          {job.company_profiles?.company_name}
                        </p>

                        <div className="flex items-center justify-between border-t border-border/50 pt-4">
                      <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-lg font-black text-transparent">
                        {formatSalary(job.salary_min, job.salary_max)}
                      </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                            {job.location}
                      </span>
                        </div>
                      </div>
                    </Card>
                ))}

                {/* CTA Card */}
                <Card className="overflow-hidden border-0 bg-gradient-cool p-6 text-center shadow-lg">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-foreground/20">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h4 className="mb-2 font-bold">想获得更多机会？</h4>
                  <p className="mb-4 text-sm">
                    通过我们的简历诊断工具优化您的简历
                  </p>
                  <Button
                      variant="secondary"
                      className="w-full rounded-xl font-bold shadow-sm"
                  >
                    开始测评
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </JobseekerLayout>
  );
}
