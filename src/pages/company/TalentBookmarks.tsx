import { useState, useEffect } from "react";
import { CompanyLayout } from "@/components/layout/CompanyLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  MapPin,
  Briefcase,
  GraduationCap,
  Bookmark,
  Send,
  Trash2,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BookmarkedTalent {
  id: string;
  created_at: string;
  talent: {
    id: string;
    full_name: string;
    email: string;
    location: string | null;
    education_level: string | null;
    work_experience_years: number | null;
    skills: string[] | null;
  };
}

export default function CompanyTalentBookmarks() {
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<BookmarkedTalent[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<{ id: string; title: string }[]>([]);

  // Invite dialog
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<BookmarkedTalent["talent"] | null>(null);
  const [selectedJob, setSelectedJob] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  useEffect(() => {
    if (companyId) {
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

  const fetchBookmarks = async () => {
    if (!companyId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("talent_bookmarks")
      .select(`
        id,
        created_at,
        jobseeker_profiles (
          id,
          full_name,
          email,
          location,
          education_level,
          work_experience_years,
          skills
        )
      `)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "加载失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setBookmarks(
        data?.map((b: any) => ({
          id: b.id,
          created_at: b.created_at,
          talent: b.jobseeker_profiles,
        })) || []
      );
    }
    setLoading(false);
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

  const removeBookmark = async (bookmarkId: string) => {
    const { error } = await supabase
      .from("talent_bookmarks")
      .delete()
      .eq("id", bookmarkId);

    if (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "已取消收藏" });
      fetchBookmarks();
    }
  };

  const openInviteDialog = (talent: BookmarkedTalent["talent"]) => {
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
      toast({ title: "邀请已发送" });
      setInviteDialogOpen(false);
    }
    setSending(false);
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
        <div>
          <h1 className="text-2xl font-bold mb-1">人才收藏</h1>
          <p className="text-muted-foreground">管理您收藏的优秀人才</p>
        </div>

        {bookmarks.length === 0 ? (
          <Card className="p-12 text-center">
            <Bookmark className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">暂无收藏</h3>
            <p className="text-muted-foreground">在人才搜索中收藏感兴趣的人才</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{bookmark.talent.full_name}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                      {bookmark.talent.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {bookmark.talent.location}
                        </span>
                      )}
                      {bookmark.talent.education_level && (
                        <span className="flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5" />
                          {bookmark.talent.education_level}
                        </span>
                      )}
                      {bookmark.talent.work_experience_years !== null && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {bookmark.talent.work_experience_years}年经验
                        </span>
                      )}
                    </div>

                    {bookmark.talent.skills && bookmark.talent.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {bookmark.talent.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      收藏于 {formatDate(bookmark.created_at)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => openInviteDialog(bookmark.talent)}
                      disabled={jobs.length === 0}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      发送邀请
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeBookmark(bookmark.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
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
