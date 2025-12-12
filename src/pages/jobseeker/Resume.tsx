import { JobseekerLayout } from "@/components/layout/JobseekerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Eye, Download, Trash2, Plus, CheckCircle2, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Resume {
  id: string;
  name: string;
  file_url: string;
  file_size: number | null;
  is_default: boolean;
  created_at: string;
}

export default function JobseekerResume() {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [jobseekerId, setJobseekerId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState<Resume | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (jobseekerId) {
      fetchResumes();
    }
  }, [jobseekerId]);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUserId(session.user.id);
      const { data } = await supabase
        .from("jobseeker_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (data) {
        setJobseekerId(data.id);
      }
    }
    setLoading(false);
  };

  const fetchResumes = async () => {
    if (!jobseekerId) return;

    const { data, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("jobseeker_id", jobseekerId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "加载简历失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setResumes(data || []);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !jobseekerId || !userId) return;

    // Validate file type
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "文件格式不支持",
        description: "请上传 PDF 或 Word 文档",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "文件大小不能超过 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(fileName);

      // Check if this is the first resume (make it default)
      const isFirstResume = resumes.length === 0;

      // Insert into database
      const { error: dbError } = await supabase.from("resumes").insert({
        jobseeker_id: jobseekerId,
        name: file.name,
        file_url: fileName,
        file_size: file.size,
        is_default: isFirstResume,
      });

      if (dbError) throw dbError;

      toast({
        title: "上传成功",
        description: "简历已上传",
      });

      fetchResumes();
    } catch (error: any) {
      toast({
        title: "上传失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!jobseekerId) return;

    try {
      // First, unset all defaults
      await supabase
        .from("resumes")
        .update({ is_default: false })
        .eq("jobseeker_id", jobseekerId);

      // Set the selected one as default
      const { error } = await supabase
        .from("resumes")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "设置成功",
        description: "默认简历已更新",
      });

      fetchResumes();
    } catch (error: any) {
      toast({
        title: "设置失败",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (resume: Resume) => {
    setResumeToDelete(resume);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!resumeToDelete) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("resumes")
        .remove([resumeToDelete.file_url]);

      if (storageError) {
        console.error("Storage delete error:", storageError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("resumes")
        .delete()
        .eq("id", resumeToDelete.id);

      if (dbError) throw dbError;

      toast({
        title: "删除成功",
        description: "简历已删除",
      });

      fetchResumes();
    } catch (error: any) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setResumeToDelete(null);
    }
  };

  const handleView = async (resume: Resume) => {
    const { data } = await supabase.storage
      .from("resumes")
      .createSignedUrl(resume.file_url, 3600);

    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    } else {
      toast({
        title: "获取文件失败",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (resume: Resume) => {
    const { data } = await supabase.storage
      .from("resumes")
      .createSignedUrl(resume.file_url, 3600, { download: true });

    if (data?.signedUrl) {
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = resume.name;
      a.click();
    } else {
      toast({
        title: "下载失败",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "未知";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN");
  };

  if (loading) {
    return (
      <JobseekerLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </JobseekerLayout>
    );
  }

  return (
    <JobseekerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">简历管理</h1>
            <p className="text-muted-foreground">
              上传和管理您的简历文件
            </p>
          </div>
          <Button onClick={handleUploadClick} disabled={uploading}>
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {uploading ? "上传中..." : "上传简历"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Tips */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium mb-1">简历小贴士</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 建议上传 PDF 格式，保持格式统一美观</li>
                <li>• 针对不同岗位可准备多份简历，突出相关经验</li>
                <li>• 定期更新简历，保持信息最新</li>
                <li>• 支持 PDF、DOC、DOCX 格式，最大 10MB</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Resumes List */}
        {resumes.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">暂无简历，请上传您的第一份简历</p>
            <Button onClick={handleUploadClick} disabled={uploading}>
              <Plus className="w-4 h-4 mr-2" />
              上传简历
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {resumes.map((resume) => (
              <Card
                key={resume.id}
                className={`p-6 ${resume.is_default ? "ring-2 ring-primary" : ""}`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* File Icon */}
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-7 h-7 text-primary" />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{resume.name}</h3>
                      {resume.is_default && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          默认
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(resume.file_size)}</span>
                      <span>上传于 {formatDate(resume.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!resume.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(resume.id)}
                      >
                        设为默认
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleView(resume)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(resume)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => confirmDelete(resume)}
                      disabled={resume.is_default}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Online Resume Builder */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">在线简历制作</h3>
              <p className="text-muted-foreground">
                使用我们的在线工具，快速创建专业的简历，支持多种模板
              </p>
            </div>
            <Button variant="outline" disabled>
              即将上线
            </Button>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除简历 "{resumeToDelete?.name}" 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </JobseekerLayout>
  );
}
