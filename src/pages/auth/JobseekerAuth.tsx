import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Briefcase, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const REMEMBER_EMAIL_KEY = "joblink_jobseeker_email";

export default function JobseekerAuth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(searchParams.get("action") !== "signup");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  // Check if already logged in
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        checkUserRoleAndRedirect(session.user.id);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkUserRoleAndRedirect(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRoleAndRedirect = async (userId: string) => {
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (roleData?.role === "jobseeker") {
      navigate("/jobseeker/dashboard");
    } else if (roleData?.role === "company") {
      // Company user trying to login on jobseeker page
      await supabase.auth.signOut();
      toast({
        title: "登录失败",
        description: "企业用户请在企业登录页面登录",
        variant: "destructive",
      });
    } else if (roleData?.role === "admin") {
      navigate("/admin/dashboard");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "请输入邮箱",
        description: "请输入您的邮箱地址以重置密码",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "邮件已发送",
        description: "请查收邮箱中的密码重置链接",
      });
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "发送失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, email);
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Verify user role is jobseeker
        if (data.user) {
          const { data: roleData, error: roleQueryError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.user.id)
            .maybeSingle();

          if (roleQueryError) {
            console.error("Failed to query user role:", roleQueryError);
            throw new Error("查询用户角色失败，请稍后重试。");
          }

          // 如果还没有角色记录，自动为此账号创建 jobseeker 角色
          if (!roleData?.role) {
            const { error: insertRoleError } = await supabase
              .from("user_roles")
              .insert({
                user_id: data.user.id,
                role: "jobseeker",
              });

            if (insertRoleError) {
              console.error("Failed to auto create jobseeker role:", insertRoleError);
              throw new Error("初始化用户角色失败，请联系管理员或稍后重试。");
            }
          }

          if (roleData?.role !== "jobseeker" && roleData?.role !== "admin") {
            await supabase.auth.signOut();
            throw new Error("企业用户请在企业登录页面登录");
          }
        }

        toast({
          title: "登录成功",
          description: "欢迎回来！",
        });
      } else {
        // Signup
        if (password !== confirmPassword) {
          throw new Error("两次输入的密码不一致");
        }

        if (password.length < 6) {
          throw new Error("密码长度至少为6位");
        }

        const redirectUrl = `${window.location.origin}/`;

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: name,
              user_type: "jobseeker",
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Create user role
          const { error: roleError } = await supabase.from("user_roles").insert({
            user_id: data.user.id,
            role: "jobseeker",
          });

          if (roleError) {
            console.error("Failed to create user role:", roleError);
            throw new Error(`创建用户角色失败: ${roleError.message}`);
          }

          // Create jobseeker profile
          const { error: profileError } = await supabase.from("jobseeker_profiles").insert({
            user_id: data.user.id,
            full_name: name,
            email: email,
          });

          if (profileError) {
            console.error("Failed to create jobseeker profile:", profileError);
            // 如果创建 profile 失败，尝试删除已创建的角色（可选）
            await supabase.from("user_roles").delete().eq("user_id", data.user.id);
            throw new Error(`创建求职者档案失败: ${profileError.message}`);
          }

          toast({
            title: "注册成功",
            description: "欢迎加入 JobLink！",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: isLogin ? "登录失败" : "注册失败",
        description: error.message || "请稍后重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isForgotPassword) {
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
            <Button variant="ghost" size="sm" className="mb-6 -ml-2" onClick={() => setIsForgotPassword(false)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回登录
            </Button>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">忘记密码</h1>
              <p className="text-muted-foreground">
                输入您的邮箱地址，我们将发送密码重置链接
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="请输入邮箱地址"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "发送中..." : "发送重置链接"}
              </Button>
            </form>
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
          <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回首页
            </Link>
          </Button>

          {/* User Type Badge */}
          <div className="flex items-center justify-center gap-2 mb-6 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <User className="w-5 h-5 text-primary" />
            <span className="font-medium text-primary">求职者登录</span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">
              {isLogin ? "欢迎回来" : "创建账户"}
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? "登录后继续探索工作机会" : "加入 JobLink，开启求职之旅"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="请输入您的姓名"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="请输入邮箱地址"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入密码"
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

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">确认密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="请再次输入密码"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    记住邮箱
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setIsForgotPassword(true)}
                >
                  忘记密码？
                </button>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "处理中..." : isLogin ? "登录" : "注册"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "还没有账户？" : "已有账户？"}
            </span>
            <button
              type="button"
              className="text-primary hover:underline ml-1 font-medium"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "立即注册" : "立即登录"}
            </button>
          </div>

          <div className="mt-4 text-center">
            <Link to="/auth/company" className="text-sm text-muted-foreground hover:text-primary">
              企业用户？点击这里登录
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
