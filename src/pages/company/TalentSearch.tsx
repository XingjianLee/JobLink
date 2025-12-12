import { useState, useEffect } from "react";
import { CompanyLayout } from "@/components/layout/CompanyLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Search,
  Users,
  MapPin,
  Briefcase,
  GraduationCap,
  Bookmark,
  BookmarkCheck,
  Send,
  Loader2,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Talent {
  id: string;
  full_name: string;
  email: string;
  location: string | null;
  education_level: string | null;
  work_experience_years: number | null;
  current_status: string | null;
  skills: string[] | null;
  bio: string | null;
}

const educationLevels = ["不限", "高中", "大专", "本科", "硕士", "博士"];
const experienceLevels = ["不限", "应届生", "1-3年", "3-5年", "5-10年", "10年以上"];
const locations = ["全部", "北京", "上海", "深圳", "杭州", "广州", "成都", "南京"];

export default function CompanyTalentSearch() {
  const { toast } = useToast();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [bookmarkedTalents, setBookmarkedTalents] = useState<Set<string>>(new Set());
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);

  // Search filters
  const [keyword, setKeyword] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("全部");
  const [selectedEducation, setSelectedEducation] = useState("不限");
  const [selectedExperience, setSelectedExperience] = useState("不限");

  // Invite dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);
  const [selectedJob, setSelectedJob] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchTalents();
      fetchBookmarks();
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
  };

  const fetchTalents = async () => {
    setLoading(true);

    let query = supabase
      .from("jobseeker_profiles")
      .select("id, full_name, email, location, education_level, work_experience_years, current_status, skills, bio")
      .eq("is_public", true)
      .order("updated_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      toast({
        title: "加载失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setTalents(data || []);
    }
    setLoading(false);
  };

  const fetchBookmarks = async () => {
    if (!companyId) return;

    const { data } = await supabase
      .from("talent_bookmarks")
      .select("jobseeker_id")
      .eq("company_id", companyId);

    if (data) {
      setBookmarkedTalents(new Set(data.map((b) => b.jobseeker_id)));
    }
  };

  const fetchJobs = async () => {
    if (!companyId) return;

    const { data } = await supabase
      .from("jobs")
      .select("id, title")
      .eq("company_id", companyId)
      .eq("status", "open");

    setJobs(data || []);
  };

  const toggleBookmark = async (talentId: string) => {
    if (!companyId) return;

    const isBookmarked = bookmarkedTalents.has(talentId);

    if (isBookmarked) {
      const { error } = await supabase
        .from("talent_bookmarks")
        .delete()
        .eq("company_id", companyId)
        .eq("jobseeker_id", talentId);

      if (!error) {
        setBookmarkedTalents((prev) => {
          const newSet = new Set(prev);
          newSet.delete(talentId);
          return newSet;
        });
        toast({ title: "已取消收藏" });
      }
    } else {
      const { error } = await supabase.from("talent_bookmarks").insert({
        company_id: companyId,
        jobseeker_id: talentId,
      });

      if (!error) {
        setBookmarkedTalents((prev) => new Set(prev).add(talentId));
        toast({ title: "已收藏" });
      }
    }
  };

  const openInviteDialog = (talent: Talent) => {
    setSelectedTalent(talent);
    setSelectedJob("");
    setInviteMessage("");
    setInviteDialogOpen(true);
  };

  const sendInvitation = async () => {
    if (!companyId || !selectedTalent) return;

    if (!selectedJob) {
      toast({
        title: "请选择职位",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    // Check if already invited
    const { data: existing } = await supabase
      .from("job_invitations")
      .select("id")
      .eq("company_id", companyId)
      .eq("jobseeker_id", selectedTalent.id)
      .eq("job_id", selectedJob)
      .maybeSingle();

    if (existing) {
      toast({
        title: "已发送过邀请",
        description: "您已向该求职者发送过此职位的邀请",
        variant: "destructive",
      });
      setSending(false);
      return;
    }

    const { error } = await supabase.from("job_invitations").insert({
      company_id: companyId,
      jobseeker_id: selectedTalent.id,
      job_id: selectedJob,
      message: inviteMessage || null,
    });

    if (error) {
      toast({
        title: "发送失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "邀请已发送",
        description: "求职者将收到您的面试邀请",
      });
      setInviteDialogOpen(false);
    }
    setSending(false);
  };

  const getExperienceRange = (years: number | null) => {
    if (years === null) return null;
    if (years === 0) return "应届生";
    if (years <= 3) return "1-3年";
    if (years <= 5) return "3-5年";
    if (years <= 10) return "5-10年";
    return "10年以上";
  };

  const filteredTalents = talents.filter((talent) => {
    const keywordMatch =
      !keyword ||
      talent.full_name.toLowerCase().includes(keyword.toLowerCase()) ||
      talent.skills?.some((s) => s.toLowerCase().includes(keyword.toLowerCase()));

    const locationMatch =
      selectedLocation === "全部" || talent.location === selectedLocation;

    const educationMatch =
      selectedEducation === "不限" || talent.education_level === selectedEducation;

    const expRange = getExperienceRange(talent.work_experience_years);
    const experienceMatch = selectedExperience === "不限" || expRange === selectedExperience;

    return keywordMatch && locationMatch && educationMatch && experienceMatch;
  });

  const clearFilters = () => {
    setKeyword("");
    setSelectedLocation("全部");
    setSelectedEducation("不限");
    setSelectedExperience("不限");
  };

  const hasActiveFilters =
    keyword || selectedLocation !== "全部" || selectedEducation !== "不限" || selectedExperience !== "不限";

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
        <div>
          <h1 className="text-2xl font-bold mb-1">人才搜索</h1>
          <p className="text-muted-foreground">搜索和发现优秀人才</p>
        </div>

        {/* Search Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索姓名或技能..."
                className="pl-10"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full md:w-32">
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

            <Select value={selectedEducation} onValueChange={setSelectedEducation}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {educationLevels.map((edu) => (
                  <SelectItem key={edu} value={edu}>
                    {edu}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedExperience} onValueChange={setSelectedExperience}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {experienceLevels.map((exp) => (
                  <SelectItem key={exp} value={exp}>
                    {exp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-muted-foreground">已筛选：</span>
              {keyword && (
                <Badge variant="secondary" className="gap-1">
                  关键词: {keyword}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setKeyword("")} />
                </Badge>
              )}
              {selectedLocation !== "全部" && (
                <Badge variant="secondary" className="gap-1">
                  {selectedLocation}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedLocation("全部")} />
                </Badge>
              )}
              {selectedEducation !== "不限" && (
                <Badge variant="secondary" className="gap-1">
                  {selectedEducation}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedEducation("不限")} />
                </Badge>
              )}
              {selectedExperience !== "不限" && (
                <Badge variant="secondary" className="gap-1">
                  {selectedExperience}经验
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedExperience("不限")} />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                清除全部
              </Button>
            </div>
          )}
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            找到 <span className="font-semibold text-foreground">{filteredTalents.length}</span> 位人才
          </p>
        </div>

        {filteredTalents.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">未找到符合条件的人才</h3>
            <p className="text-muted-foreground">尝试调整筛选条件</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTalents.map((talent) => (
              <Card key={talent.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{talent.full_name}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                      {talent.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {talent.location}
                        </span>
                      )}
                      {talent.education_level && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {talent.education_level}
                        </span>
                      )}
                      {talent.work_experience_years !== null && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {talent.work_experience_years}年经验
                        </span>
                      )}
                    </div>

                    {talent.skills && talent.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {talent.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {talent.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{talent.skills.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleBookmark(talent.id)}
                  >
                    {bookmarkedTalents.has(talent.id) ? (
                      <BookmarkCheck className="w-4 h-4 mr-1 text-primary" />
                    ) : (
                      <Bookmark className="w-4 h-4 mr-1" />
                    )}
                    收藏
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openInviteDialog(talent)}
                    disabled={jobs.length === 0}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    发送邀请
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>发送招聘邀请</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">邀请对象</p>
              <p className="font-medium">{selectedTalent?.full_name}</p>
            </div>

            <div className="space-y-2">
              <Label>选择职位</Label>
              <Select value={selectedJob} onValueChange={setSelectedJob}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择要邀请的职位" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>邀请留言（可选）</Label>
              <Textarea
                placeholder="向求职者发送一段邀请信息..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={sendInvitation} disabled={sending}>
              {sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              发送邀请
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CompanyLayout>
  );
}
