import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Check if we have access token in URL (from email link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    
    if (!accessToken) {
      toast({
        title: "链接无效",
        description: "请重新请求密码重置链接",
        variant: "destructive",
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "两次输入的密码不一致",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "密码太短",
        description: "密码长度至少为6位",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: "密码重置成功",
        description: "您现在可以使用新密码登录",
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/auth/jobseeker");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "重置失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen hero-bg flex flex-col">
        <header className="container py-6">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-md">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold">
              Job<span className="text-primary">Link</span>
            </span>
          </Link>
        </header>

        <main className="flex-1 container flex items-center justify-center py-12">
          <Card className="w-full max-w-md p-8 animate-scale-in text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">密码重置成功</h1>
            <p className="text-muted-foreground mb-4">
              正在跳转到登录页面...
            </p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-bg flex flex-col">
      <header className="container py-6">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-md">
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold">
            Job<span className="text-primary">Link</span>
          </span>
        </Link>
      </header>

      <main className="flex-1 container flex items-center justify-center py-12">
        <Card className="w-full max-w-md p-8 animate-scale-in">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">设置新密码</h1>
            <p className="text-muted-foreground">
              请输入您的新密码
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">新密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入新密码"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="请再次输入新密码"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "处理中..." : "重置密码"}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
