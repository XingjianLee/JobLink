import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { JobseekerLayout } from "@/components/layout/JobseekerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BookmarkedJob {
  id: string;
  created_at: string;
  jobs: {
    id: string;
    title: string;
    location: string;
    salary_min: number | null;
    salary_max: number | null;
    job_type: string | null;
    skills_required: string[] | null;
    status: string | null;
    company_profiles: {
      company_name: string;
      logo_url: string | null;
    } | null;
  } | null;
}

const jobTypeLabels: Record<string, string> = {
  "full-time": "全职",
  "part-time": "兼职",
  contract: "合同工",
  internship: "实习",
  freelance: "自由职业",
};

export default function JobseekerBookmarks() {
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<BookmarkedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobseekerId, setJobseekerId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
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
      setJobseekerId(profile.id);

      const { data, error } = await supabase
        .from("job_bookmarks")
        .select(`
          id,
          created_at,
          jobs (
            id,
            title,
            location,
            salary_min,
            salary_max,
            job_type,
            skills_required,
            status,
            company_profiles (
              company_name,
              logo_url
            )
          )
        `)
        .eq("jobseeker_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (bookmarkId: string) => {
    const { error } = await supabase
      .from("job_bookmarks")
      .delete()
      .eq("id", bookmarkId);

    if (!error) {
      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      toast({
        title: "已取消收藏",
        description: "该职位已从收藏列表中移除",
      });
    }
  };

  const handleApply = async (jobId: string, companyName: string) => {
    if (!jobseekerId) return;

    // Check if already applied
    const { data: existing } = await supabase
      .from("job_applications")
      .select("id")
      .eq("jobseeker_id", jobseekerId)
      .eq("job_id", jobId)
      .maybeSingle();

    if (existing) {
      toast({
        title: "您已投递过该职位",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("job_applications")
      .insert({ jobseeker_id: jobseekerId, job_id: jobId });

    if (error) {
      toast({
        title: "投递失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "投递成功",
        description: `您已成功向 ${companyName} 投递简历`,
      });
    }
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "面议";
    if (min && max) return `${min / 1000}K-${max / 1000}K`;
    if (min) return `${min / 1000}K起`;
    return `${max! / 1000}K`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN");
  };

  const openJobs = bookmarks.filter((b) => b.jobs?.status === "open");
  const closedJobs = bookmarks.filter((b) => b.jobs?.status !== "open");

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
          <h1 className="text-2xl font-bold mb-2">收藏职位</h1>
          <p className="text-muted-foreground">
            管理您收藏的职位，随时投递
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <Card className="px-4 py-3 flex items-center gap-3">
            <Bookmark className="w-5 h-5 text-primary" />
            <span className="font-medium">{openJobs.length} 个在招职位</span>
          </Card>
          {closedJobs.length > 0 && (
            <Card className="px-4 py-3 flex items-center gap-3">
              <Bookmark className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground">{closedJobs.length} 个已关闭</span>
            </Card>
          )}
        </div>

        {/* Jobs List */}
        {bookmarks.length === 0 ? (
          <Card className="p-12 text-center">
            <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">暂无收藏的职位</p>
            <Button asChild>
              <Link to="/jobseeker/search">去发现职位</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <Card
                key={bookmark.id}
                className={`p-6 ${bookmark.jobs?.status !== "open" ? "opacity-60" : ""}`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Company Logo */}
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    {bookmark.jobs?.company_profiles?.logo_url ? (
                      <img 
                        src={bookmark.jobs.company_profiles.logo_url} 
                        alt=""
                        className="w-full h-full rounded-xl object-cover"
                      />
                    ) : (
                      <Building2 className="w-7 h-7 text-muted-foreground" />
                    )}
                  </div>

                  {/* Job Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{bookmark.jobs?.title || "未知职位"}</h3>
                      {bookmark.jobs?.status !== "open" && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-destructive/10 text-destructive rounded">
                          已关闭
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="font-medium text-foreground">
                        {bookmark.jobs?.company_profiles?.company_name || "未知企业"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {bookmark.jobs?.location || "未知"}
                      </span>
                      {bookmark.jobs?.job_type && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {jobTypeLabels[bookmark.jobs.job_type] || bookmark.jobs.job_type}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-primary font-medium">
                        <DollarSign className="w-4 h-4" />
                        {formatSalary(bookmark.jobs?.salary_min || null, bookmark.jobs?.salary_max || null)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {bookmark.jobs?.skills_required?.map((skill) => (
                        <span key={skill} className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                      收藏于 {formatDate(bookmark.created_at)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(bookmark.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      查看详情
                    </Button>
                    {bookmark.jobs?.status === "open" && bookmark.jobs?.id && (
                      <Button 
                        size="sm" 
                        onClick={() => handleApply(
                          bookmark.jobs!.id, 
                          bookmark.jobs?.company_profiles?.company_name || "该企业"
                        )}
                      >
                        投递简历
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </JobseekerLayout>
  );
}
