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
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  MapPin,
  Clock,
  Building2,
  Bookmark,
  BookmarkCheck,
  X,
  Loader2,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp,
  Briefcase,
  SlidersHorizontal,
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

// 薪资范围选项
const salaryRanges = [
  { value: "all", label: "不限薪资", min: null, max: null },
  { value: "0-10", label: "10K以下", min: 0, max: 10000 },
  { value: "10-20", label: "10K-20K", min: 10000, max: 20000 },
  { value: "20-30", label: "20K-30K", min: 20000, max: 30000 },
  { value: "30-50", label: "30K-50K", min: 30000, max: 50000 },
  { value: "50+", label: "50K以上", min: 50000, max: null },
];

// 发布时间选项
const postedTimeOptions = [
  { value: "all", label: "不限时间" },
  { value: "24h", label: "24小时内" },
  { value: "3d", label: "3天内" },
  { value: "7d", label: "一周内" },
  { value: "30d", label: "一个月内" },
];

// 热门技能标签
const popularSkills = [
  "React", "Vue", "TypeScript", "JavaScript", "Python",
  "Java", "Node.js", "Go", "MySQL", "MongoDB",
  "Docker", "Kubernetes", "AWS", "数据分析", "机器学习"
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

  // 新增筛选状态
  const [salaryRange, setSalaryRange] = useState(searchParams.get("salary") || "all");
  const [postedWithin, setPostedWithin] = useState(searchParams.get("posted") || "all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
      searchParams.get("skills")?.split(",").filter(Boolean) || []
  );
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

      // Apply filters - 原有筛选逻辑
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

      // 新增筛选逻辑 - 薪资范围
      const salary = searchParams.get("salary");
      if (salary && salary !== "all") {
        const range = salaryRanges.find(r => r.value === salary);
        if (range) {
          if (range.min !== null) {
            query = query.gte("salary_min", range.min);
          }
          if (range.max !== null) {
            query = query.lte("salary_max", range.max);
          }
        }
      }

      // 新增筛选逻辑 - 发布时间
      const posted = searchParams.get("posted");
      if (posted && posted !== "all") {
        const daysMap: Record<string, number> = { "24h": 1, "3d": 3, "7d": 7, "30d": 30 };
        const days = daysMap[posted];
        if (days) {
          const date = new Date();
          date.setDate(date.getDate() - days);
          query = query.gte("created_at", date.toISOString());
        }
      }

      // 新增筛选逻辑 - 技能筛选
      const skills = searchParams.get("skills");
      if (skills) {
        const skillList = skills.split(",").filter(Boolean);
        if (skillList.length > 0) {
          query = query.overlaps("skills_required", skillList);
        }
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
    // 原有参数
    if (keyword) params.set("q", keyword);
    if (selectedLocation !== "全部") params.set("location", selectedLocation);
    if (selectedJobType !== "all") params.set("type", selectedJobType);
    // 新增参数
    if (salaryRange !== "all") params.set("salary", salaryRange);
    if (postedWithin !== "all") params.set("posted", postedWithin);
    if (selectedSkills.length > 0) params.set("skills", selectedSkills.join(","));
    setSearchParams(params);
  };

  const clearFilters = () => {
    setKeyword("");
    setSelectedLocation("全部");
    setSelectedJobType("all");
    setSalaryRange("all");
    setPostedWithin("all");
    setSelectedSkills([]);
    setSearchParams({});
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
        prev.includes(skill)
            ? prev.filter(s => s !== skill)
            : [...prev, skill]
    );
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

  const hasActiveFilters =
      keyword ||
      selectedLocation !== "全部" ||
      selectedJobType !== "all" ||
      salaryRange !== "all" ||
      postedWithin !== "all" ||
      selectedSkills.length > 0;

  return (
      <JobseekerLayout>
        <div className="space-y-8">
          {/* Hero Header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border/50 p-8 md:p-12">
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                搜索职位
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl">
                发现适合您的工作机会，开启职业新篇章
              </p>
            </div>
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
          </div>

          {/* Search Filters */}
          <Card className="p-6 md:p-8 border-border/50 shadow-lg shadow-primary/5 backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    type="text"
                    placeholder="搜索职位、公司或关键词..."
                    className="pl-12 h-14 text-base border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl transition-all"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              {/* Filters Row */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Location Select */}
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="w-full sm:w-44 h-14 border-border/50 rounded-xl">
                    <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
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
                  <SelectTrigger className="w-full sm:w-44 h-14 border-border/50 rounded-xl">
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
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

                <Button
                    size="lg"
                    onClick={handleSearch}
                    className="h-14 px-8 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
                >
                  <Search className="w-5 h-5 mr-2" />
                  搜索职位
                </Button>

                {/* 高级筛选按钮 */}
                <Button
                    variant="outline"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="h-14 px-4 rounded-xl border-border/50 hover:border-primary/50 transition-all"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  高级筛选
                  {showAdvancedFilters ? (
                      <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                      <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </Button>
              </div>
            </div>

            {/* 高级筛选面板 */}
            <Collapsible open={showAdvancedFilters}>
              <CollapsibleContent>
                <div className="mt-6 pt-6 border-t border-border/50 space-y-6">
                  {/* 薪资范围和发布时间 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <DollarSign className="w-4 h-4" />
                        薪资范围
                      </label>
                      <Select value={salaryRange} onValueChange={setSalaryRange}>
                        <SelectTrigger className="h-12 border-border/50 rounded-xl">
                          <SelectValue placeholder="选择薪资范围" />
                        </SelectTrigger>
                        <SelectContent>
                          {salaryRanges.map((range) => (
                              <SelectItem key={range.value} value={range.value}>
                                {range.label}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        发布时间
                      </label>
                      <Select value={postedWithin} onValueChange={setPostedWithin}>
                        <SelectTrigger className="h-12 border-border/50 rounded-xl">
                          <SelectValue placeholder="选择发布时间" />
                        </SelectTrigger>
                        <SelectContent>
                          {postedTimeOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 技能标签 */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">技能要求（点击选择）</span>
                      {selectedSkills.length > 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        已选 {selectedSkills.length} 项
                      </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {popularSkills.map((skill) => (
                          <Badge
                              key={skill}
                              variant={selectedSkills.includes(skill) ? "default" : "outline"}
                              className={`cursor-pointer transition-all py-1.5 px-3 ${
                                  selectedSkills.includes(skill)
                                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                                      : "hover:border-primary/50 hover:text-primary hover:bg-primary/5"
                              }`}
                              onClick={() => toggleSkill(skill)}
                          >
                            {skill}
                            {selectedSkills.includes(skill) && (
                                <X className="w-3 h-3 ml-1.5" />
                            )}
                          </Badge>
                      ))}
                    </div>
                  </div>

                  {/* 应用高级筛选按钮 */}
                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                        variant="ghost"
                        onClick={() => {
                          setSalaryRange("all");
                          setPostedWithin("all");
                          setSelectedSkills([]);
                        }}
                        className="text-muted-foreground hover:text-foreground"
                    >
                      重置高级筛选
                    </Button>
                    <Button
                        onClick={handleSearch}
                        className="bg-primary hover:bg-primary/90"
                    >
                      应用筛选
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Active Filters */}
            {hasActiveFilters && (
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-border/50 flex-wrap">
                  <span className="text-sm font-medium text-muted-foreground">筛选条件：</span>
                  {keyword && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                  <Search className="w-3 h-3" />
                        {keyword}
                        <button
                            onClick={() => setKeyword("")}
                            className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                        >
                    <X className="w-3 h-3" />
                  </button>
                </span>
                  )}
                  {selectedLocation !== "全部" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                  <MapPin className="w-3 h-3" />
                        {selectedLocation}
                        <button
                            onClick={() => setSelectedLocation("全部")}
                            className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                        >
                    <X className="w-3 h-3" />
                  </button>
                </span>
                  )}
                  {selectedJobType !== "all" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                  <Clock className="w-3 h-3" />
                        {jobTypes.find((t) => t.value === selectedJobType)?.label}
                        <button
                            onClick={() => setSelectedJobType("all")}
                            className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                        >
                    <X className="w-3 h-3" />
                  </button>
                </span>
                  )}
                  {/* 薪资范围标签 */}
                  {salaryRange !== "all" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                  <DollarSign className="w-3 h-3" />
                        {salaryRanges.find(r => r.value === salaryRange)?.label}
                        <button
                            onClick={() => setSalaryRange("all")}
                            className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                        >
                    <X className="w-3 h-3" />
                  </button>
                </span>
                  )}
                  {/* 发布时间标签 */}
                  {postedWithin !== "all" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                  <Calendar className="w-3 h-3" />
                        {postedTimeOptions.find(o => o.value === postedWithin)?.label}
                        <button
                            onClick={() => setPostedWithin("all")}
                            className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                        >
                    <X className="w-3 h-3" />
                  </button>
                </span>
                  )}
                  {/* 技能标签 */}
                  {selectedSkills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                  <Briefcase className="w-3 h-3" />
                        {skill}
                        <button
                            onClick={() => toggleSkill(skill)}
                            className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                        >
                    <X className="w-3 h-3" />
                  </button>
                </span>
                  ))}
                  <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-muted-foreground hover:text-foreground"
                  >
                    清除全部
                  </Button>
                </div>
            )}
          </Card>

          {/* Results Header */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              共找到 <span className="font-bold text-foreground text-lg">{jobs.length}</span> 个职位
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                </div>
                <p className="text-muted-foreground animate-pulse">正在搜索职位...</p>
              </div>
          ) : jobs.length === 0 ? (
              <Card className="p-16 text-center border-dashed border-2 border-border/50 bg-muted/20">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-xl mb-2">暂无匹配职位</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {hasActiveFilters ? "尝试调整筛选条件，扩大搜索范围" : "企业正在发布中，请稍后再来查看"}
                </p>
                {hasActiveFilters && (
                    <Button variant="outline" onClick={clearFilters} className="mt-6">
                      清除筛选条件
                    </Button>
                )}
              </Card>
          ) : (
              /* Jobs List */
              <div className="grid gap-4">
                {jobs.map((job, index) => (
                    <Card
                        key={job.id}
                        className="group p-6 border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
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
                            <h3 className="font-semibold text-xl group-hover:text-primary transition-colors truncate">
                              {job.title}
                            </h3>
                            <div className="shrink-0 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                        <span className="text-lg font-bold text-primary">
                          {job.salary_min && job.salary_max
                              ? `${job.salary_min / 1000}K-${job.salary_max / 1000}K`
                              : "薪资面议"}
                        </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm mb-4">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        {job.company_profiles?.company_name || "未知企业"}
                      </span>
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

                          <div className="flex flex-wrap gap-2">
                            {job.skills_required?.slice(0, 6).map((skill) => (
                                <span
                                    key={skill}
                                    className="inline-flex items-center px-3 py-1 rounded-lg bg-secondary/80 text-secondary-foreground text-xs font-medium border border-border/50"
                                >
                          {skill}
                        </span>
                            ))}
                            {(job.skills_required?.length || 0) > 6 && (
                                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-muted text-muted-foreground text-xs">
                          +{(job.skills_required?.length || 0) - 6}
                        </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border/50">
                          <Button
                              variant="outline"
                              size="icon"
                              className={`w-12 h-12 rounded-xl border-border/50 transition-all ${
                                  bookmarkedJobs.has(job.id)
                                      ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
                                      : 'hover:border-primary/30 hover:text-primary'
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
                            投递简历
                          </Button>
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
