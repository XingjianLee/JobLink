import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Resume {
  id: string;
  name: string;
  file_url: string;
  is_default: boolean;
}

interface ProfileForm {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  current_status: string;
}

interface ApplyJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
  companyName: string;
  jobseekerId: string;
}

const statusOptions = [
  { value: "actively_looking", label: "积极找工作" },
  { value: "open_to_offers", label: "考虑新机会" },
  { value: "not_looking", label: "暂不考虑" },
];

export function ApplyJobModal({
  open,
  onOpenChange,
  jobId,
  jobTitle,
  companyName,
  jobseekerId,
}: ApplyJobModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [coverLetter, setCoverLetter] = useState("");
  const [profileForm, setProfileForm] = useState<ProfileForm>({
    full_name: "",
    email: "",
    phone: "",
    location: "",
    current_status: "",
  });

  useEffect(() => {
    if (open && jobseekerId) {
      fetchProfile();
      fetchResumes();
    }
  }, [open, jobseekerId]);

  const fetchResumes = async () => {
    const { data, error } = await supabase
      .from("resumes")
      .select("id, name, file_url, is_default")
      .eq("jobseeker_id", jobseekerId)
      .order("is_default", { ascending: false });

    if (data && !error) {
      setResumes(data);
      // Set default resume as selected
      const defaultResume = data.find((r) => r.is_default);
      if (defaultResume) {
        setSelectedResumeId(defaultResume.id);
      } else if (data.length > 0) {
        setSelectedResumeId(data[0].id);
      }
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("jobseeker_profiles")
        .select("id, full_name, email, phone, location, current_status")
        .eq("id", jobseekerId)
        .single();

      if (error) throw error;
      setProfileForm({
        full_name: data.full_name || "",
        email: data.email || "",
        phone: data.phone || "",
        location: data.location || "",
        current_status: data.current_status || "",
      });
    } catch (error: any) {
      toast({
        title: "获取个人信息失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (resumes.length > 0 && !selectedResumeId) {
      toast({
        title: "请选择简历",
        variant: "destructive",
      });
      return;
    }

    if (!profileForm.full_name || !profileForm.email) {
      toast({
        title: "请填写必要的个人信息",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
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
        onOpenChange(false);
        return;
      }

      // Update profile if changed
      await supabase
        .from("jobseeker_profiles")
        .update({
          full_name: profileForm.full_name,
          email: profileForm.email,
          phone: profileForm.phone || null,
          location: profileForm.location || null,
          current_status: profileForm.current_status || null,
        })
        .eq("id", jobseekerId);

      const selectedResume = resumes.find((r) => r.id === selectedResumeId);

      const { error } = await supabase.from("job_applications").insert({
        jobseeker_id: jobseekerId,
        job_id: jobId,
        resume_url: selectedResume?.file_url || null,
        cover_letter: coverLetter || null,
      });

      if (error) throw error;

      toast({
        title: "投递成功",
        description: "企业将尽快查看您的简历",
      });
      onOpenChange(false);
      setCoverLetter("");
    } catch (error: any) {
      toast({
        title: "投递失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>投递简历</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Job Info */}
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground">申请职位</p>
              <p className="font-semibold">{jobTitle}</p>
              <p className="text-sm text-muted-foreground">{companyName}</p>
            </div>

            {/* Resume Selection */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <FileText className="w-4 h-4" />
                选择简历
              </Label>
              {resumes.length === 0 ? (
                <div className="p-4 rounded-lg border border-dashed text-center text-muted-foreground">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">暂无简历，请先在简历管理页面上传简历</p>
                </div>
              ) : (
                <RadioGroup
                  value={selectedResumeId}
                  onValueChange={setSelectedResumeId}
                  className="grid grid-cols-1 md:grid-cols-2 gap-2"
                >
                  {resumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-secondary/50 transition-colors"
                    >
                      <RadioGroupItem value={resume.id} id={resume.id} />
                      <Label
                        htmlFor={resume.id}
                        className="flex items-center gap-2 cursor-pointer flex-1"
                      >
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{resume.name}</span>
                        {resume.is_default && (
                          <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                            默认
                          </span>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>

            <Separator />

            {/* Editable Personal Info */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-base font-semibold">
                <User className="w-4 h-4" />
                确认个人信息
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    姓名 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    value={profileForm.full_name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, full_name: e.target.value })
                    }
                    placeholder="请输入姓名"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    邮箱 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                    placeholder="请输入邮箱"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">联系电话</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phone: e.target.value })
                    }
                    placeholder="请输入联系电话"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">所在地区</Label>
                  <Input
                    id="location"
                    value={profileForm.location}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, location: e.target.value })
                    }
                    placeholder="请输入所在地区"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="current_status">求职状态</Label>
                  <Select
                    value={profileForm.current_status}
                    onValueChange={(value) =>
                      setProfileForm({ ...profileForm, current_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择求职状态" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Cover Letter / Notes */}
            <div className="space-y-3">
              <Label htmlFor="coverLetter" className="text-base font-semibold">
                备注信息（可选）
              </Label>
              <Textarea
                id="coverLetter"
                placeholder="向招聘方说点什么，让您的申请更出彩..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                您可以在这里补充说明您对该职位的兴趣、相关经验或其他想让招聘方了解的信息。
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || loading}>
            {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            确认投递
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
