import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  TrendingUp,
  Loader2,
  Target,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ApplyJobModal } from "@/components/jobseeker/ApplyJobModal";

interface Job {
  id: string;
  title: string;
  location: string;
  salary_min: number | null;
  salary_max: number | null;
  job_type: string | null;
  skills_required: string[] | null;
  description: string;
  created_at: string;
  company_profiles: {
    id: string;
    company_name: string;
    logo_url: string | null;
  } | null;
  match_score?: number;
}

const jobTypeLabels: Record<string, string> = {
  "full-time": "全职",
  "part-time": "兼职",
  contract: "合同工",
  internship: "实习",
  freelance: "自由职业",
};

export function SmartJobRecommendations() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [jobseekerId, setJobseekerId] = useState<string | null>(null);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set());
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchProfileAndRecommendations();
  }, []);

  useEffect(() => {
    if (jobseekerId) {
      fetchBookmarks();
    }
  }, [jobseekerId]);

  const fetchProfileAndRecommendations = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "请先登录",
          variant: "destructive",
        });
        return;
      }

      // 获取用户资料
      const { data: profileData } = await supabase
        .from("jobseeker_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
        setJobseekerId(profileData.id);
        await fetchRecommendedJobs(profileData);
      } else {
        toast({
          title: "请先完善个人资料",
          description: "完善资料后可以获得更精准的职位推荐",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "加载失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedJobs = async (profileData: any) => {
    try {
      // 获取所有开放职位
      let query = supabase
        .from("jobs")
        .select(`
          id,
          title,
          location,
          salary_min,
          salary_max,
          job_type,
          skills_required,
          description,
          created_at,
          company_profiles (
            id,
            company_name,
            logo_url
          )
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false });

      const { data: allJobs, error } = await query;

      if (error) throw error;

      // 计算匹配度并排序
      const jobsWithScores = (allJobs || []).map((job) => {
        let score = 0;
        let matchFactors: string[] = [];

        // 1. 技能匹配（40%）
        if (profileData.skills && job.skills_required) {
          const userSkills = profileData.skills || [];
          const jobSkills = job.skills_required || [];
          const matchedSkills = userSkills.filter((skill: string) =>
            jobSkills.some((js: string) =>
              js.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(js.toLowerCase())
            )
          );
          const skillMatchRatio = jobSkills.length > 0 
            ? matchedSkills.length / jobSkills.length 
            : 0;
          score += skillMatchRatio * 40;
          if (matchedSkills.length > 0) {
            matchFactors.push(`技能匹配：${matchedSkills.length}/${jobSkills.length}`);
          }
        }

        // 2. 位置匹配（20%）
        if (profileData.location && job.location) {
          if (profileData.location === job.location) {
            score += 20;
            matchFactors.push("位置匹配");
          } else if (
            profileData.location.includes(job.location) ||
            job.location.includes(profileData.location)
          ) {
            score += 10;
            matchFactors.push("位置相近");
          }
        }

        // 3. 薪资匹配（20%）
        if (profileData.expected_salary_min && job.salary_min) {
          const expectedMin = profileData.expected_salary_min;
          const jobMin = job.salary_min;
          const jobMax = job.salary_max || jobMin * 1.5;

          if (expectedMin >= jobMin && expectedMin <= jobMax) {
            score += 20;
            matchFactors.push("薪资匹配");
          } else if (expectedMin <= jobMax && expectedMin >= jobMin * 0.8) {
            score += 10;
            matchFactors.push("薪资接近");
          }
        }

        // 4. 工作类型匹配（10%）
        if (profileData.current_status && job.job_type) {
          const statusMap: Record<string, string[]> = {
            unemployed: ["full-time", "part-time"],
            student: ["internship", "part-time"],
            employed: ["full-time", "contract"],
            freelance: ["freelance", "contract"],
          };
          const preferredTypes = statusMap[profileData.current_status] || [];
          if (preferredTypes.includes(job.job_type)) {
            score += 10;
            matchFactors.push("工作类型匹配");
          }
        }

        // 5. 教育背景匹配（10%）
        if (profileData.education_level && job.education_required) {
          const educationLevels = ["高中及以下", "大专", "本科", "硕士", "博士"];
          const userLevelIndex = educationLevels.indexOf(profileData.education_level);
          const jobLevelIndex = educationLevels.indexOf(job.education_required);
          if (userLevelIndex >= jobLevelIndex) {
            score += 10;
            matchFactors.push("学历匹配");
          }
        }

        return {
          ...job,
          match_score: Math.round(score),
          match_factors: matchFactors,
        };
      });

      // 按匹配度排序，只显示匹配度 > 0 的职位
      const sortedJobs = jobsWithScores
        .filter((job) => job.match_score && job.match_score > 0)
        .sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
        .slice(0, 20); // 只显示前20个

      setJobs(sortedJobs);
    } catch (error: any) {
      console.error("Error fetching recommendations:", error);
    }
  };

  const fetchBookmarks = async () => {
    if (!jobseekerId) return;

    const { data } = await supabase
      .from("job_bookmarks")
      .select("job_id")
      .eq("jobseeker_id", jobseekerId);

    if (data) {
      setBookmarkedJobs(new Set(data.map((b) => b.job_id)));
    }
  };

  const toggleBookmark = async (jobId: string) => {
    if (!jobseekerId) {
      toast({
        title: "请先完善个人资料",
        variant: "destructive",
      });
      return;
    }

    const isBookmarked = bookmarkedJobs.has(jobId);

    if (isBookmarked) {
      const { error } = await supabase
        .from("job_bookmarks")
        .delete()
        .eq("jobseeker_id", jobseekerId)
        .eq("job_id", jobId);

      if (!error) {
        setBookmarkedJobs((prev) => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
        toast({ title: "已取消收藏" });
      }
    } else {
      const { error } = await supabase
        .from("job_bookmarks")
        .insert({ jobseeker_id: jobseekerId, job_id: jobId });

      if (!error) {
        setBookmarkedJobs((prev) => new Set(prev).add(jobId));
        toast({ title: "已收藏" });
      }
    }
  };

  const openApplyModal = (job: Job) => {
    if (!jobseekerId) {
      toast({
        title: "请先完善个人资料",
        variant: "destructive",
      });
      return;
    }
    setSelectedJob(job);
    setApplyModalOpen(true);
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-blue-600 bg-blue-50";
    if (score >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">AI正在分析您的资料并推荐职位...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="p-12 text-center">
        <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-xl mb-2">请先完善个人资料</h3>
        <p className="text-muted-foreground mb-6">
          完善您的个人资料、技能和求职偏好后，AI才能为您推荐最匹配的职位
        </p>
        <Button onClick={() => window.location.href = "/jobseeker/profile"}>
          去完善资料
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">智能职位推荐</h3>
            <p className="text-sm text-muted-foreground mb-4">
              基于您的个人资料、技能和求职偏好，我们为您推荐了以下匹配度最高的职位
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>已分析 {jobs.length} 个职位</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchProfileAndRecommendations}
              >
                刷新推荐
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-2">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-xl mb-2">暂无推荐职位</h3>
          <p className="text-muted-foreground mb-6">
            请完善您的个人资料和技能信息，以便AI为您推荐合适的职位
          </p>
          <Button onClick={() => window.location.href = "/jobseeker/profile"}>
            去完善资料
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <Card
              key={job.id}
              className="group p-6 border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                {/* Company Logo */}
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center shrink-0 ring-1 ring-border/50 group-hover:ring-primary/30 transition-all overflow-hidden">
                  {job.company_profiles?.logo_url ? (
                    <img
                      src={job.company_profiles.logo_url}
                      alt={job.company_profiles.company_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 lg:w-10 lg:h-10 text-muted-foreground" />
                  )}
                </div>

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl group-hover:text-primary transition-colors mb-2">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          {job.company_profiles?.company_name || "未知企业"}
                        </span>
                        {job.match_score !== undefined && (
                          <Badge
                            className={`${getMatchColor(job.match_score)} font-semibold`}
                          >
                            匹配度 {job.match_score}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                      <span className="text-lg font-bold text-primary">
                        {job.salary_min && job.salary_max
                          ? `${job.salary_min / 1000}K-${job.salary_max / 1000}K`
                          : "薪资面议"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm mb-4">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                    {job.job_type && (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {jobTypeLabels[job.job_type] || job.job_type}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills_required?.slice(0, 6).map((skill) => (
                      <Badge
                        key={skill}
                        variant={
                          profile.skills?.some((s: string) =>
                            s.toLowerCase().includes(skill.toLowerCase()) ||
                            skill.toLowerCase().includes(s.toLowerCase())
                          )
                            ? "default"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {(job.skills_required?.length || 0) > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{(job.skills_required?.length || 0) - 6}
                      </Badge>
                    )}
                  </div>

                  {/* Match Factors */}
                  {(job as any).match_factors && (job as any).match_factors.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {(job as any).match_factors.map((factor: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-muted rounded">
                          {factor}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border/50">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`w-12 h-12 rounded-xl border-border/50 transition-all ${
                      bookmarkedJobs.has(job.id)
                        ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
                        : "hover:border-primary/30 hover:text-primary"
                    }`}
                    onClick={() => toggleBookmark(job.id)}
                  >
                    {bookmarkedJobs.has(job.id) ? (
                      <BookmarkCheck className="w-5 h-5" />
                    ) : (
                      <Bookmark className="w-5 h-5" />
                    )}
                  </Button>
                  <Button
                    onClick={() => openApplyModal(job)}
                    className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
                  >
                    立即投递
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Apply Job Modal */}
      {selectedJob && (
        <ApplyJobModal
          open={applyModalOpen}
          onOpenChange={setApplyModalOpen}
          jobId={selectedJob.id}
          jobTitle={selectedJob.title}
          companyName={selectedJob.company_profiles?.company_name || "未知企业"}
          jobseekerId={jobseekerId!}
        />
      )}
    </div>
  );
}

