import { useEffect, useState } from "react";
import { JobseekerLayout } from "@/components/layout/JobseekerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Camera, Plus, X, Save, CheckCircle2, Mail, Lock, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const educationLevels = [
  "高中及以下",
  "大专",
  "本科",
  "硕士",
  "博士",
];

const currentStatuses = [
  { value: "employed", label: "在职" },
  { value: "unemployed", label: "待业" },
  { value: "student", label: "在校学生" },
  { value: "freelance", label: "自由职业" },
];

const genderOptions = [
  { value: "male", label: "男" },
  { value: "female", label: "女" },
  { value: "other", label: "其他" },
];

export default function JobseekerProfile() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [profile, setProfile] = useState<any>({
    full_name: "",
    phone: "",
    gender: "",
    birth_date: "",
    location: "",
    education_level: "",
    work_experience_years: 0,
    current_status: "",
    expected_salary_min: "",
    expected_salary_max: "",
    skills: [],
    bio: "",
  });
  const [newSkill, setNewSkill] = useState("");

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Email change state
  const [newEmail, setNewEmail] = useState("");
  const [changingEmail, setChangingEmail] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUserEmail(session.user.email || "");
      
      const { data, error } = await supabase
        .from("jobseeker_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (data) {
        setProfile({
          ...data,
          skills: data.skills || [],
          expected_salary_min: data.expected_salary_min || "",
          expected_salary_max: data.expected_salary_max || "",
        });
      }
    }
    setLoading(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("未登录");

      const updateData = {
        full_name: profile.full_name,
        phone: profile.phone,
        gender: profile.gender || null,
        birth_date: profile.birth_date || null,
        location: profile.location,
        education_level: profile.education_level,
        work_experience_years: parseInt(profile.work_experience_years) || 0,
        current_status: profile.current_status || null,
        expected_salary_min: parseInt(profile.expected_salary_min) || null,
        expected_salary_max: parseInt(profile.expected_salary_max) || null,
        skills: profile.skills,
        bio: profile.bio,
      };

      const { error } = await supabase
        .from("jobseeker_profiles")
        .update(updateData)
        .eq("user_id", session.user.id);

      if (error) throw error;

      toast({
        title: "保存成功",
        description: "您的个人资料已更新",
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

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "新密码和确认密码不一致",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "密码太短",
        description: "密码长度至少为6位",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      toast({
        title: "密码修改成功",
        description: "您的密码已更新",
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast({
        title: "修改失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      toast({
        title: "邮箱格式错误",
        description: "请输入有效的邮箱地址",
        variant: "destructive",
      });
      return;
    }

    setChangingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;

      toast({
        title: "验证邮件已发送",
        description: "请查看新邮箱中的验证链接完成修改",
      });

      setNewEmail("");
    } catch (error: any) {
      toast({
        title: "修改失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setChangingEmail(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s: string) => s !== skill),
    });
  };

  if (loading) {
    return (
      <JobseekerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </JobseekerLayout>
    );
  }

  return (
    <JobseekerLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">个人资料</h1>
          <p className="text-muted-foreground">管理您的账户和个人信息</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              个人资料
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <Shield className="w-4 h-4" />
              账户设置
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6 mt-6">
            {/* Avatar Section */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">头像</h3>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    建议上传清晰的职业照，尺寸不小于 200x200 像素
                  </p>
                  <Button variant="outline" size="sm">
                    上传头像
                  </Button>
                </div>
              </div>
            </Card>

            {/* Basic Info */}
            <Card className="p-6">
              <h3 className="font-semibold mb-6">基本信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">姓名 *</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="请输入您的姓名"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">手机号</Label>
                  <Input
                    id="phone"
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="请输入手机号"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">性别</Label>
                  <Select
                    value={profile.gender || ""}
                    onValueChange={(value) => setProfile({ ...profile, gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth_date">出生日期</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={profile.birth_date || ""}
                    onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">所在城市</Label>
                  <Input
                    id="location"
                    value={profile.location || ""}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    placeholder="如：北京"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current_status">当前状态</Label>
                  <Select
                    value={profile.current_status || ""}
                    onValueChange={(value) => setProfile({ ...profile, current_status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Professional Info */}
            <Card className="p-6">
              <h3 className="font-semibold mb-6">职业信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="education_level">最高学历</Label>
                  <Select
                    value={profile.education_level || ""}
                    onValueChange={(value) => setProfile({ ...profile, education_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="work_experience_years">工作年限</Label>
                  <Input
                    id="work_experience_years"
                    type="number"
                    min="0"
                    value={profile.work_experience_years || ""}
                    onChange={(e) => setProfile({ ...profile, work_experience_years: e.target.value })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expected_salary_min">期望薪资（月薪）</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="expected_salary_min"
                      type="number"
                      value={profile.expected_salary_min || ""}
                      onChange={(e) => setProfile({ ...profile, expected_salary_min: e.target.value })}
                      placeholder="最低"
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input
                      id="expected_salary_max"
                      type="number"
                      value={profile.expected_salary_max || ""}
                      onChange={(e) => setProfile({ ...profile, expected_salary_max: e.target.value })}
                      placeholder="最高"
                    />
                    <span className="text-muted-foreground whitespace-nowrap">元</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Skills */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">技能标签</h3>
              <p className="text-sm text-muted-foreground mb-4">
                添加您的专业技能，帮助企业更好地了解您
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.skills.map((skill: string) => (
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
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="输入技能名称"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                />
                <Button variant="outline" onClick={addSkill}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加
                </Button>
              </div>
            </Card>

            {/* Bio */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">个人简介</h3>
              <Textarea
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="介绍一下您自己，包括您的职业目标、核心优势和工作经历亮点..."
                rows={5}
              />
              <p className="text-sm text-muted-foreground mt-2">
                建议 100-500 字，突出您的核心竞争力
              </p>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button size="lg" onClick={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <>保存中...</>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    保存资料
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6 mt-6">
            {/* Email Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Mail className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">邮箱设置</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>当前邮箱</Label>
                  <div className="flex items-center gap-2">
                    <Input value={userEmail} disabled className="bg-muted" />
                    <Badge variant="outline" className="shrink-0">已验证</Badge>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-sm font-medium">修改邮箱</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    修改后需要验证新邮箱才能生效
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="输入新邮箱地址"
                    />
                    <Button 
                      onClick={handleChangeEmail} 
                      disabled={changingEmail || !newEmail}
                    >
                      {changingEmail ? "发送中..." : "发送验证"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Password Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">密码设置</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">新密码</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="输入新密码（至少6位）"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">确认新密码</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="再次输入新密码"
                  />
                </div>

                <Button 
                  onClick={handleChangePassword} 
                  disabled={changingPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                >
                  {changingPassword ? "修改中..." : "修改密码"}
                </Button>
              </div>
            </Card>

            {/* Account Security */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">账户安全</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">两步验证</p>
                    <p className="text-sm text-muted-foreground">使用验证器应用增强账户安全</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    即将推出
                  </Button>
                </div>

                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">登录设备管理</p>
                    <p className="text-sm text-muted-foreground">查看和管理已登录的设备</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    即将推出
                  </Button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-destructive">注销账户</p>
                    <p className="text-sm text-muted-foreground">永久删除您的账户和所有数据</p>
                  </div>
                  <Button variant="destructive" size="sm" disabled>
                    注销账户
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </JobseekerLayout>
  );
}
