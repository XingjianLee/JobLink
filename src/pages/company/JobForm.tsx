import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CompanyLayout } from "@/components/layout/CompanyLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JobFormData {
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  location: string;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_negotiable: boolean;
  education_required: string;
  experience_required: string;
  skills_required: string[];
  positions_available: number;
  is_remote: boolean;
  application_deadline: string;
}

const jobTypes = [
  { value: "full-time", label: "全职" },
  { value: "part-time", label: "兼职" },
  { value: "internship", label: "实习" },
  { value: "contract", label: "合同工" },
];

const educationLevels = [
  { value: "不限", label: "不限" },
  { value: "高中", label: "高中" },
  { value: "大专", label: "大专" },
  { value: "本科", label: "本科" },
  { value: "硕士", label: "硕士" },
  { value: "博士", label: "博士" },
];

const experienceLevels = [
  { value: "不限", label: "不限" },
  { value: "应届生", label: "应届生" },
  { value: "1-3年", label: "1-3年" },
  { value: "3-5年", label: "3-5年" },
  { value: "5-10年", label: "5-10年" },
  { value: "10年以上", label: "10年以上" },
];

const locations = ["北京", "上海", "深圳", "杭州", "广州", "成都", "南京", "武汉", "西安", "苏州"];

export default function CompanyJobForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    requirements: "",
    benefits: "",
    location: "",
    job_type: "full-time",
    salary_min: null,
    salary_max: null,
    salary_negotiable: false,
    education_required: "不限",
    experience_required: "不限",
    skills_required: [],
    positions_available: 1,
    is_remote: false,
    application_deadline: "",
  });

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  useEffect(() => {
    if (isEdit && companyId) {
      fetchJob();
    }
  }, [isEdit, companyId]);

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

  const fetchJob = async () => {
    if (!id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast({
        title: "加载失败",
        description: error.message,
        variant: "destructive",
      });
      navigate("/company/jobs");
      return;
    }

    setFormData({
      title: data.title,
      description: data.description,
      requirements: data.requirements || "",
      benefits: data.benefits || "",
      location: data.location,
      job_type: data.job_type || "full-time",
      salary_min: data.salary_min,
      salary_max: data.salary_max,
      salary_negotiable: data.salary_negotiable || false,
      education_required: data.education_required || "不限",
      experience_required: data.experience_required || "不限",
      skills_required: data.skills_required || [],
      positions_available: data.positions_available || 1,
      is_remote: data.is_remote || false,
      application_deadline: data.application_deadline || "",
    });
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!companyId) {
      toast({
        title: "错误",
        description: "未找到企业信息",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.description || !formData.location) {
      toast({
        title: "请填写必填项",
        description: "职位名称、职位描述和工作地点为必填",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    const jobData = {
      company_id: companyId,
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements || null,
      benefits: formData.benefits || null,
      location: formData.location,
      job_type: formData.job_type,
      salary_min: formData.salary_min,
      salary_max: formData.salary_max,
      salary_negotiable: formData.salary_negotiable,
      education_required: formData.education_required,
      experience_required: formData.experience_required,
      skills_required: formData.skills_required,
      positions_available: formData.positions_available,
      is_remote: formData.is_remote,
      application_deadline: formData.application_deadline || null,
      status: "open",
    };

    let error;
    if (isEdit) {
      const result = await supabase
        .from("jobs")
        .update(jobData)
        .eq("id", id);
      error = result.error;
    } else {
      const result = await supabase.from("jobs").insert(jobData);
      error = result.error;
    }

    if (error) {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: isEdit ? "职位已更新" : "职位已发布",
        description: isEdit ? "职位信息已保存" : "您的职位已成功发布",
      });
      navigate("/company/jobs");
    }
    setSaving(false);
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills_required.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills_required: [...formData.skills_required, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills_required: formData.skills_required.filter((s) => s !== skill),
    });
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
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/company/jobs")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{isEdit ? "编辑职位" : "发布新职位"}</h1>
            <p className="text-muted-foreground">
              {isEdit ? "修改职位信息" : "填写职位详情以发布招聘"}
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">基本信息</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                职位名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="例如：高级前端开发工程师"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">
                  工作地点 <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择城市" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job_type">工作类型</Label>
                <Select
                  value={formData.job_type}
                  onValueChange={(value) => setFormData({ ...formData, job_type: value })}
                >
                  <SelectTrigger>
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
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_remote"
                  checked={formData.is_remote}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_remote: checked })}
                />
                <Label htmlFor="is_remote">支持远程办公</Label>
              </div>
            </div>
          </div>
        </Card>

        {/* Salary */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">薪资待遇</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary_min">最低薪资（元/月）</Label>
                <Input
                  id="salary_min"
                  type="number"
                  value={formData.salary_min || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, salary_min: parseInt(e.target.value) || null })
                  }
                  placeholder="例如：15000"
                  disabled={formData.salary_negotiable}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary_max">最高薪资（元/月）</Label>
                <Input
                  id="salary_max"
                  type="number"
                  value={formData.salary_max || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, salary_max: parseInt(e.target.value) || null })
                  }
                  placeholder="例如：25000"
                  disabled={formData.salary_negotiable}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="salary_negotiable"
                checked={formData.salary_negotiable}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, salary_negotiable: checked })
                }
              />
              <Label htmlFor="salary_negotiable">薪资面议</Label>
            </div>
          </div>
        </Card>

        {/* Requirements */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">职位要求</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="education">学历要求</Label>
                <Select
                  value={formData.education_required}
                  onValueChange={(value) => setFormData({ ...formData, education_required: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {educationLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">经验要求</Label>
                <Select
                  value={formData.experience_required}
                  onValueChange={(value) => setFormData({ ...formData, experience_required: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>技能要求</Label>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="输入技能后按回车添加"
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  添加
                </Button>
              </div>
              {formData.skills_required.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.skills_required.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-sm"
                    >
                      {skill}
                      <button onClick={() => removeSkill(skill)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">职位详情</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">
                职位描述 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="详细描述工作内容和职责..."
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requirements">任职要求</Label>
              <Textarea
                id="requirements"
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="列出对候选人的具体要求..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="benefits">福利待遇</Label>
              <Textarea
                id="benefits"
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                placeholder="描述公司提供的福利..."
                rows={3}
              />
            </div>
          </div>
        </Card>

        {/* Other Settings */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">其他设置</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="positions">招聘人数</Label>
              <Input
                id="positions"
                type="number"
                min={1}
                value={formData.positions_available}
                onChange={(e) =>
                  setFormData({ ...formData, positions_available: parseInt(e.target.value) || 1 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">截止日期</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.application_deadline}
                onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate("/company/jobs")}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEdit ? "保存修改" : "发布职位"}
          </Button>
        </div>
      </div>
    </CompanyLayout>
  );
}
