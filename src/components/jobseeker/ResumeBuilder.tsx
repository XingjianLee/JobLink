import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { optimizeResumeWithAI, type ResumeData as ResumeDataType } from "@/lib/openai";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ResumeData {
  // 基本信息
  fullName: string;
  email: string;
  phone: string;
  location: string;
  // 教育背景
  education: Array<{
    school: string;
    degree: string;
    major: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  // 工作经历
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
  }>;
  // 技能
  skills: string[];
  // 项目经历
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  // 自我评价
  summary: string;
}

const steps = [
  { id: 1, title: "基本信息", description: "填写您的个人基本信息" },
  { id: 2, title: "教育背景", description: "添加您的教育经历" },
  { id: 3, title: "工作经历", description: "填写您的工作经验" },
  { id: 4, title: "技能与项目", description: "展示您的技能和项目经验" },
  { id: 5, title: "完成", description: "预览并保存简历" },
];

export function ResumeBuilder() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState<string | null>(null);
  const [useOptimized, setUseOptimized] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [jobseekerId, setJobseekerId] = useState<string | null>(null);

  const [resumeData, setResumeData] = useState<ResumeData>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    education: [{ school: "", degree: "", major: "", startDate: "", endDate: "", description: "" }],
    workExperience: [{ company: "", position: "", startDate: "", endDate: "", description: "", achievements: [] }],
    skills: [],
    projects: [{ name: "", description: "", technologies: [], link: "" }],
    summary: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("jobseeker_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
        setJobseekerId(data.id);
        // 预填充基本信息
        setResumeData(prev => ({
          ...prev,
          fullName: data.full_name || "",
          email: data.email || session.user.email || "",
          phone: data.phone || "",
          location: data.location || "",
          skills: data.skills || [],
          summary: data.bio || "",
        }));
      }
    }
  };

  const progress = (currentStep / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { school: "", degree: "", major: "", startDate: "", endDate: "", description: "" }],
    }));
  };

  const removeEducation = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const addWorkExperience = () => {
    setResumeData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { company: "", position: "", startDate: "", endDate: "", description: "", achievements: [] }],
    }));
  };

  const removeWorkExperience = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index),
    }));
  };

  const updateWorkExperience = (index: number, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((work, i) =>
        i === index ? { ...work, [field]: value } : work
      ),
    }));
  };

  const addAchievement = (workIndex: number) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((work, i) =>
        i === workIndex
          ? { ...work, achievements: [...work.achievements, ""] }
          : work
      ),
    }));
  };

  const updateAchievement = (workIndex: number, achievementIndex: number, value: string) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((work, i) =>
        i === workIndex
          ? {
              ...work,
              achievements: work.achievements.map((ach, j) =>
                j === achievementIndex ? value : ach
              ),
            }
          : work
      ),
    }));
  };

  const removeAchievement = (workIndex: number, achievementIndex: number) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map((work, i) =>
        i === workIndex
          ? {
              ...work,
              achievements: work.achievements.filter((_, j) => j !== achievementIndex),
            }
          : work
      ),
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: "", description: "", technologies: [], link: "" }],
    }));
  };

  const removeProject = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  const updateProject = (index: number, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) =>
        i === index ? { ...project, [field]: value } : project
      ),
    }));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !resumeData.skills.includes(skill.trim())) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()],
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

  const generateResumeText = () => {
    let text = `简历\n\n`;
    text += `个人信息\n`;
    text += `姓名：${resumeData.fullName}\n`;
    text += `邮箱：${resumeData.email}\n`;
    text += `电话：${resumeData.phone}\n`;
    text += `地址：${resumeData.location}\n\n`;

    if (resumeData.summary) {
      text += `自我评价\n${resumeData.summary}\n\n`;
    }

    if (resumeData.education.length > 0 && resumeData.education[0].school) {
      text += `教育背景\n`;
      resumeData.education.forEach(edu => {
        if (edu.school) {
          text += `${edu.school} - ${edu.degree} - ${edu.major}\n`;
          if (edu.startDate && edu.endDate) {
            text += `${edu.startDate} 至 ${edu.endDate}\n`;
          }
          if (edu.description) {
            text += `${edu.description}\n`;
          }
          text += `\n`;
        }
      });
    }

    if (resumeData.workExperience.length > 0 && resumeData.workExperience[0].company) {
      text += `工作经历\n`;
      resumeData.workExperience.forEach(work => {
        if (work.company) {
          text += `${work.position} - ${work.company}\n`;
          if (work.startDate && work.endDate) {
            text += `${work.startDate} 至 ${work.endDate}\n`;
          }
          if (work.description) {
            text += `${work.description}\n`;
          }
          if (work.achievements.length > 0) {
            text += `主要成就：\n`;
            work.achievements.forEach(ach => {
              if (ach) text += `• ${ach}\n`;
            });
          }
          text += `\n`;
        }
      });
    }

    if (resumeData.skills.length > 0) {
      text += `技能\n${resumeData.skills.join("、")}\n\n`;
    }

    if (resumeData.projects.length > 0 && resumeData.projects[0].name) {
      text += `项目经历\n`;
      resumeData.projects.forEach(project => {
        if (project.name) {
          text += `${project.name}\n`;
          if (project.description) {
            text += `${project.description}\n`;
          }
          if (project.technologies.length > 0) {
            text += `技术栈：${project.technologies.join("、")}\n`;
          }
          if (project.link) {
            text += `项目链接：${project.link}\n`;
          }
          text += `\n`;
        }
      });
    }

    return text;
  };

  const handleOptimizeResume = async () => {
    setOptimizing(true);
    try {
      const optimized = await optimizeResumeWithAI(resumeData as ResumeDataType);
      setOptimizedResume(optimized);
      setUseOptimized(true);
      toast({
        title: "优化成功",
        description: "AI已优化您的简历内容",
      });
    } catch (error: any) {
      toast({
        title: "优化失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setOptimizing(false);
    }
  };

  const handleSaveResume = async () => {
    if (!jobseekerId) {
      toast({
        title: "错误",
        description: "请先完善个人资料",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // 使用AI优化后的简历或原始简历
      const resumeText = useOptimized && optimizedResume 
        ? optimizedResume 
        : generateResumeText();
      
      // 创建文本文件
      const blob = new Blob([resumeText], { type: "text/plain;charset=utf-8" });
      const fileName = `简历_${resumeData.fullName || "我的简历"}_${Date.now()}.txt`;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("未登录");

      // 上传到存储
      const fileExt = "txt";
      const storageFileName = `${session.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(storageFileName, blob, {
          contentType: "text/plain",
        });

      if (uploadError) throw uploadError;

      // 保存到数据库
      const { error: dbError } = await supabase.from("resumes").insert({
        jobseeker_id: jobseekerId,
        name: fileName,
        file_url: storageFileName,
        file_size: blob.size,
        is_default: false,
      });

      if (dbError) throw dbError;

      toast({
        title: "保存成功",
        description: useOptimized && optimizedResume 
          ? "AI优化后的简历已保存到您的简历库" 
          : "简历已保存到您的简历库",
      });
    } catch (error: any) {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              步骤 {currentStep} / {steps.length}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-sm">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex flex-col items-center gap-1 ${
                  step.id <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.id < currentStep
                      ? "bg-primary text-primary-foreground"
                      : step.id === currentStep
                      ? "bg-primary/20 text-primary border-2 border-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.id < currentStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className="text-xs text-center max-w-20">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Step Content */}
      <Card className="p-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">基本信息</h3>
              <p className="text-muted-foreground">请填写您的基本个人信息</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">姓名 *</Label>
                <Input
                  id="fullName"
                  value={resumeData.fullName}
                  onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                  placeholder="请输入您的姓名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">邮箱 *</Label>
                <Input
                  id="email"
                  type="email"
                  value={resumeData.email}
                  onChange={(e) => setResumeData({ ...resumeData, email: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">电话</Label>
                <Input
                  id="phone"
                  value={resumeData.phone}
                  onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                  placeholder="请输入电话号码"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">所在城市</Label>
                <Input
                  id="location"
                  value={resumeData.location}
                  onChange={(e) => setResumeData({ ...resumeData, location: e.target.value })}
                  placeholder="如：北京"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="summary">自我评价</Label>
              <Textarea
                id="summary"
                value={resumeData.summary}
                onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                placeholder="简要介绍自己，突出您的核心优势和职业目标..."
                rows={5}
              />
            </div>
          </div>
        )}

        {/* Step 2: Education */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">教育背景</h3>
                <p className="text-muted-foreground">添加您的教育经历</p>
              </div>
              <Button variant="outline" onClick={addEducation}>
                <Plus className="w-4 h-4 mr-2" />
                添加教育经历
              </Button>
            </div>
            {resumeData.education.map((edu, index) => (
              <Card key={index} className="p-4 border-dashed">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">教育经历 {index + 1}</span>
                  {resumeData.education.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEducation(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>学校名称 *</Label>
                    <Input
                      value={edu.school}
                      onChange={(e) => updateEducation(index, "school", e.target.value)}
                      placeholder="请输入学校名称"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>学历 *</Label>
                    <Select
                      value={edu.degree}
                      onValueChange={(value) => updateEducation(index, "degree", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="选择学历" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="高中">高中</SelectItem>
                        <SelectItem value="大专">大专</SelectItem>
                        <SelectItem value="本科">本科</SelectItem>
                        <SelectItem value="硕士">硕士</SelectItem>
                        <SelectItem value="博士">博士</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>专业</Label>
                    <Input
                      value={edu.major}
                      onChange={(e) => updateEducation(index, "major", e.target.value)}
                      placeholder="请输入专业名称"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>时间</Label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                        placeholder="开始时间"
                      />
                      <Input
                        type="date"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                        placeholder="结束时间"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>描述</Label>
                    <Textarea
                      value={edu.description}
                      onChange={(e) => updateEducation(index, "description", e.target.value)}
                      placeholder="在校期间的主要成就、荣誉等..."
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Step 3: Work Experience */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">工作经历</h3>
                <p className="text-muted-foreground">填写您的工作经验</p>
              </div>
              <Button variant="outline" onClick={addWorkExperience}>
                <Plus className="w-4 h-4 mr-2" />
                添加工作经历
              </Button>
            </div>
            {resumeData.workExperience.map((work, index) => (
              <Card key={index} className="p-4 border-dashed">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-medium">工作经历 {index + 1}</span>
                  {resumeData.workExperience.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeWorkExperience(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>公司名称 *</Label>
                    <Input
                      value={work.company}
                      onChange={(e) => updateWorkExperience(index, "company", e.target.value)}
                      placeholder="请输入公司名称"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>职位 *</Label>
                    <Input
                      value={work.position}
                      onChange={(e) => updateWorkExperience(index, "position", e.target.value)}
                      placeholder="请输入职位名称"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>时间</Label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={work.startDate}
                        onChange={(e) => updateWorkExperience(index, "startDate", e.target.value)}
                        placeholder="开始时间"
                      />
                      <Input
                        type="date"
                        value={work.endDate}
                        onChange={(e) => updateWorkExperience(index, "endDate", e.target.value)}
                        placeholder="结束时间"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>工作描述</Label>
                    <Textarea
                      value={work.description}
                      onChange={(e) => updateWorkExperience(index, "description", e.target.value)}
                      placeholder="描述您的主要工作内容和职责..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>主要成就</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addAchievement(index)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        添加成就
                      </Button>
                    </div>
                    {work.achievements.map((ach, achIndex) => (
                      <div key={achIndex} className="flex gap-2">
                        <Input
                          value={ach}
                          onChange={(e) => updateAchievement(index, achIndex, e.target.value)}
                          placeholder="描述您的成就..."
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAchievement(index, achIndex)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Step 4: Skills & Projects */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">技能与项目</h3>
              <p className="text-muted-foreground">展示您的技能和项目经验</p>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <Label>技能标签</Label>
              <div className="flex flex-wrap gap-2 mb-4">
                {resumeData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-3 py-1 gap-1">
                    {skill}
                    <button onClick={() => removeSkill(skill)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="输入技能名称，按回车添加"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
                <Button
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    if (input) {
                      addSkill(input.value);
                      input.value = "";
                    }
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加
                </Button>
              </div>
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>项目经历</Label>
                <Button variant="outline" onClick={addProject}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加项目
                </Button>
              </div>
              {resumeData.projects.map((project, index) => (
                <Card key={index} className="p-4 border-dashed">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">项目 {index + 1}</span>
                    {resumeData.projects.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeProject(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>项目名称 *</Label>
                      <Input
                        value={project.name}
                        onChange={(e) => updateProject(index, "name", e.target.value)}
                        placeholder="请输入项目名称"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>项目描述</Label>
                      <Textarea
                        value={project.description}
                        onChange={(e) => updateProject(index, "description", e.target.value)}
                        placeholder="描述项目的主要功能和您的贡献..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>技术栈（用逗号分隔）</Label>
                      <Input
                        value={project.technologies.join(", ")}
                        onChange={(e) =>
                          updateProject(
                            index,
                            "technologies",
                            e.target.value.split(",").map((t) => t.trim()).filter(Boolean)
                          )
                        }
                        placeholder="如：React, TypeScript, Node.js"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>项目链接（可选）</Label>
                      <Input
                        value={project.link || ""}
                        onChange={(e) => updateProject(index, "link", e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Preview */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">简历预览</h3>
                <p className="text-muted-foreground">预览您的简历内容，确认无误后保存</p>
              </div>
              <div className="flex items-center gap-2">
                {!optimizedResume && (
                  <Button
                    onClick={handleOptimizeResume}
                    disabled={optimizing}
                    variant="outline"
                    className="border-primary/20 hover:border-primary/40"
                  >
                    {optimizing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        AI优化中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI智能优化
                      </>
                    )}
                  </Button>
                )}
                {optimizedResume && (
                  <Button
                    onClick={() => {
                      setOptimizedResume(null);
                      setUseOptimized(false);
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    重新优化
                  </Button>
                )}
              </div>
            </div>

            {/* 切换显示原始或优化后的简历 */}
            {optimizedResume && (
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <span className="text-sm font-medium">显示版本：</span>
                <Button
                  variant={!useOptimized ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseOptimized(false)}
                >
                  原始版本
                </Button>
                <Button
                  variant={useOptimized ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseOptimized(true)}
                  className="bg-primary/10 hover:bg-primary/20"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI优化版本
                </Button>
              </div>
            )}

            <Card className="p-6 bg-muted/50">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {useOptimized && optimizedResume ? optimizedResume : generateResumeText()}
              </pre>
            </Card>

            {optimizedResume && useOptimized && (
              <Card className="p-4 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">AI优化说明</h4>
                    <p className="text-sm text-muted-foreground">
                      AI已对您的简历进行了专业优化，包括：优化表达方式、突出关键成就、使用量化数据、提升专业度等。
                      您可以选择使用优化后的版本或原始版本保存。
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  const resumeText = useOptimized && optimizedResume 
                    ? optimizedResume 
                    : generateResumeText();
                  const blob = new Blob([resumeText], { type: "text/plain;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `简历_${resumeData.fullName || "我的简历"}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                下载简历
              </Button>
              <Button onClick={handleSaveResume} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    保存到简历库
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            上一步
          </Button>
          {currentStep < steps.length ? (
            <Button onClick={nextStep}>
              下一步
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => setCurrentStep(1)} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              重新编辑
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

