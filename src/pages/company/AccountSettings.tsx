import { useState, useEffect } from "react";
import { CompanyLayout } from "@/components/layout/CompanyLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Lock, Mail, Phone, Shield, Eye, EyeOff } from "lucide-react";

export default function CompanyAccountSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // HR personal info
  const [hrInfo, setHrInfo] = useState({
    realName: "",
    phone: "",
    idNumber: "",
  });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setEmail(user.email || "");
      // Load HR info from user metadata if exists
      const metadata = user.user_metadata || {};
      setHrInfo({
        realName: metadata.hr_real_name || "",
        phone: metadata.hr_phone || "",
        idNumber: metadata.hr_id_number || "",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "请填写所有密码字段", variant: "destructive" });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({ title: "两次输入的新密码不一致", variant: "destructive" });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({ title: "新密码长度至少为6位", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({ title: "密码修改成功" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ title: "密码修改失败", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleHrInfoUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          hr_real_name: hrInfo.realName,
          hr_phone: hrInfo.phone,
          hr_id_number: hrInfo.idNumber,
        },
      });

      if (error) throw error;

      toast({ title: "HR信息更新成功" });
    } catch (error: any) {
      toast({ title: "更新失败", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CompanyLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">账号设置</h1>
          <p className="text-muted-foreground">管理您的登录信息和HR个人实名信息</p>
        </div>

        {/* Account Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              登录邮箱
            </CardTitle>
            <CardDescription>您的登录邮箱地址（不可修改）</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Input 
                value={email} 
                disabled 
                className="bg-muted cursor-not-allowed"
              />
              <Shield className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              如需更换登录邮箱，请联系客服
            </p>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              修改密码
            </CardTitle>
            <CardDescription>定期更改密码可提高账户安全性</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">当前密码</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="请输入当前密码"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="请输入新密码（至少6位）"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <Button onClick={handlePasswordChange} disabled={loading}>
              {loading ? "保存中..." : "修改密码"}
            </Button>
          </CardContent>
        </Card>

        {/* HR Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              HR实名信息
            </CardTitle>
            <CardDescription>用于身份认证和企业资质审核</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="realName">真实姓名</Label>
              <Input
                id="realName"
                value={hrInfo.realName}
                onChange={(e) => setHrInfo({ ...hrInfo, realName: e.target.value })}
                placeholder="请输入真实姓名"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hrPhone">联系电话</Label>
              <Input
                id="hrPhone"
                value={hrInfo.phone}
                onChange={(e) => setHrInfo({ ...hrInfo, phone: e.target.value })}
                placeholder="请输入联系电话"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="idNumber">身份证号</Label>
              <Input
                id="idNumber"
                value={hrInfo.idNumber}
                onChange={(e) => setHrInfo({ ...hrInfo, idNumber: e.target.value })}
                placeholder="请输入身份证号"
              />
              <p className="text-xs text-muted-foreground">
                身份信息仅用于实名认证，我们会严格保护您的隐私
              </p>
            </div>
            
            <Button onClick={handleHrInfoUpdate} disabled={loading}>
              {loading ? "保存中..." : "保存信息"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </CompanyLayout>
  );
}
