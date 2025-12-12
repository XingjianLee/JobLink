import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { JobseekerLayout } from "@/components/layout/JobseekerLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MapPin,
  Clock,
  Building2,
  Bookmark,
  BookmarkCheck,
  X,
  Loader2,
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
}

const jobTypeLabels: Record<string, string> = {
  "full-time": "全职",
  "part-time": "兼职",
  contract: "合同工",
  internship: "实习",
  freelance: "自由职业",
};

const locations = ["全部", "北京", "上海", "深圳", "杭州", "广州", "成都", "南京"];
const jobTypes = [
  { value: "all", label: "全部类型" },
  { value: "full-time", label: "全职" },
  { value: "part-time", label: "兼职" },
  { value: "internship", label: "实习" },
  { value: "contract", label: "合同工" },
];

export default function JobseekerSearch() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get("location") || "全部");
  const [selectedJobType, setSelectedJobType] = useState(searchParams.get("type") || "all");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set());
  const [jobseekerId, setJobseekerId] = useState<string | null>(null);
  
  // Apply modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    fetchJobseekerProfile();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [searchParams]);

  useEffect(() => {
    if (jobseekerId) {
      fetchBookmarks();
    }
  }, [jobseekerId]);

  const fetchJobseekerProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("jobseeker_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (data) {
        setJobseekerId(data.id);
      }
    }
  };

  const fetchBookmarks = async () => {
    if (!jobseekerId) return;
    
    const { data } = await supabase
      .from("job_bookmarks")
      .select("job_id")
      .eq("jobseeker_id", jobseekerId);
    
    if (data) {
      setBookmarkedJobs(new Set(data.map(b => b.job_id)));
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
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

      // Apply filters
      const q = searchParams.get("q");
      const location = searchParams.get("location");
      const type = searchParams.get("type");

      if (q) {
        query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      }
      if (location && location !== "全部") {
        query = query.eq("location", location);
      }
      if (type && type !== "all") {
        query = query.eq("job_type", type);
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobs(data || []);
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

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (selectedLocation !== "全部") params.set("location", selectedLocation);
    if (selectedJobType !== "all") params.set("type", selectedJobType);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setKeyword("");
    setSelectedLocation("全部");
    setSelectedJobType("all");
    setSearchParams({});
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
        setBookmarkedJobs(prev => {
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
        setBookmarkedJobs(prev => new Set(prev).add(jobId));
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

  const hasActiveFilters = keyword || selectedLocation !== "全部" || selectedJobType !== "all";

  return (
    <JobseekerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">搜索职位</h1>
          <p className="text-muted-foreground">发现适合您的工作机会</p>
        </div>

        {/* Search Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="搜索职位、公司或关键词"
                className="pl-12 h-12"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Location Select */}
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full md:w-40 h-12">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Job Type Select */}
            <Select value={selectedJobType} onValueChange={setSelectedJobType}>
              <SelectTrigger className="w-full md:w-40 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {jobTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button size="lg" onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              搜索
            </Button>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-muted-foreground">已筛选：</span>
              {keyword && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm">
                  关键词: {keyword}
                  <button onClick={() => setKeyword("")} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedLocation !== "全部" && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm">
                  {selectedLocation}
                  <button onClick={() => setSelectedLocation("全部")} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedJobType !== "all" && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm">
                  {jobTypes.find((t) => t.value === selectedJobType)?.label}
                  <button onClick={() => setSelectedJobType("all")} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                清除全部
              </Button>
            </div>
          )}
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            共找到 <span className="font-semibold text-foreground">{jobs.length}</span> 个职位
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : jobs.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">暂无职位</h3>
            <p className="text-muted-foreground">
              {hasActiveFilters ? "尝试调整筛选条件" : "企业正在发布中，请稍后再来"}
            </p>
          </Card>
        ) : (
          /* Jobs List */
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Company Logo */}
                  <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    {job.company_profiles?.logo_url ? (
                      <img 
                        src={job.company_profiles.logo_url} 
                        alt={job.company_profiles.company_name}
                        className="w-full h-full rounded-xl object-cover"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>

                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <div className="text-lg font-bold text-primary">
                        {job.salary_min && job.salary_max 
                          ? `${job.salary_min / 1000}K-${job.salary_max / 1000}K`
                          : "面议"}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="font-medium text-foreground">
                        {job.company_profiles?.company_name || "未知企业"}
                      </span>
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
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {job.skills_required?.map((skill) => (
                        <span key={skill} className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => toggleBookmark(job.id)}
                    >
                      {bookmarkedJobs.has(job.id) ? (
                        <BookmarkCheck className="w-5 h-5 text-primary" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </Button>
                    <Button onClick={() => openApplyModal(job)}>投递简历</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

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
    </JobseekerLayout>
  );
}
