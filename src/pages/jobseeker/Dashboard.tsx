import { UpcomingEventsTimeline } from "@/components/jobseeker/UpcomingEventsTimeline";
import { JobseekerLayout } from "@/components/layout/JobseekerLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Bookmark, Building2, Clock, Eye, Mail, MapPin, Send, TrendingUp } from "lucide-react";
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

  return (
    <JobseekerLayout>
      <div className="space-y-8">
        {/* Welcome Section with Profile Completion */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              欢迎回来，{profile?.full_name || "用户"}！
            </h1>
            <p className="text-muted-foreground">
              查看您的求职进度和最新动态
            </p>
          </div>
          {profileCompletion < 100 && (
            <div className="gap-3 px-4 py-3 bg-primary/10 border border-primary/30 flex items-center rounded-lg shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-primary-foreground">{profileCompletion}%</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">完善资料可提高曝光</p>
              </div>
              <Button size="sm" variant="default" className="shrink-0" asChild>
                <Link to="/jobseeker/profile">
                  去完善
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/jobseeker/applications">
            <Card className="p-6 cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Send className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.applications}</p>
                  <p className="text-sm text-muted-foreground">已投递</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/jobseeker/invitations">
            <Card className="p-6 cursor-pointer transition-all hover:shadow-md hover:border-accent/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.invitations}</p>
                  <p className="text-sm text-muted-foreground">收到邀约</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/jobseeker/resume">
            <Card className="p-6 cursor-pointer transition-all hover:shadow-md hover:border-warning/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.profileViews}</p>
                  <p className="text-sm text-muted-foreground">简历被查看</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/jobseeker/bookmarks">
            <Card className="p-6 cursor-pointer transition-all hover:shadow-md hover:border-secondary/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <Bookmark className="w-6 h-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.bookmarks}</p>
                  <p className="text-sm text-muted-foreground">收藏职位</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Upcoming Events Timeline */}
        <UpcomingEventsTimeline />

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Applications */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">最近投递</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/jobseeker/applications">
                  查看全部
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>

            {recentApplications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>暂无投递记录</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentApplications.map(app => (
                  <div key={app.id} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-card flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{app.jobs?.title || "未知职位"}</h4>
                      <p className="text-sm text-muted-foreground">
                        {app.jobs?.company_profiles?.company_name || "未知企业"}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {app.jobs?.location || "未知"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(app.applied_at)}
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${statusLabels[app.status || "pending"]?.className || statusLabels.pending.className}`}>
                      {statusLabels[app.status || "pending"]?.label || "待查看"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Invitations */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">企业邀约</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/jobseeker/invitations">
                  查看全部
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>

            {recentInvitations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>暂无待处理邀约</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentInvitations.map(inv => (
                  <div key={inv.id} className="p-4 rounded-lg border border-accent/30 bg-accent/5 hover:bg-accent/10 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">
                          {inv.company_profiles?.company_name || "未知企业"}
                        </h4>
                        <p className="text-sm text-primary">
                          {inv.jobs?.title || "未知职位"}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(inv.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {inv.message || "企业邀请您参加面试"}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => handleAcceptInvitation(inv.id)}>
                        接受邀约
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleRejectInvitation(inv.id)}>
                        暂不考虑
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Job Recommendations */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">职位推荐</h3>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/jobseeker/search">
                发现更多
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          {recommendedJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>暂无推荐职位</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedJobs.map((job) => (
                <div key={job.id} className="p-4 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer">
                  <h4 className="font-medium mb-1">{job.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {job.company_profiles?.company_name || "未知企业"}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary font-medium">
                      {formatSalary(job.salary_min, job.salary_max)}
                    </span>
                    <span className="text-muted-foreground">{job.location}</span>
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
