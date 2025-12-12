import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  Search,
  Bookmark,
  Send,
  FileText,
  Menu,
  X,
  LogOut,
  Bell,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

const navigation = [
  { name: "数据概览", href: "/company/dashboard", icon: LayoutDashboard },
  { name: "简历管理", href: "/company/applications", icon: FileText },
  { name: "职位管理", href: "/company/jobs", icon: Briefcase },
  { name: "发送的邀请", href: "/company/invitations", icon: Send },
  { name: "企业信息", href: "/company/profile", icon: Building2 },
];

const topNavigation = [
  { name: "人才搜索", href: "/company/talent-search", icon: Search },
  { name: "人才收藏", href: "/company/talent-bookmarks", icon: Bookmark },
];

interface CompanyLayoutProps {
  children: React.ReactNode;
}

export function CompanyLayout({ children }: CompanyLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [companyName, setCompanyName] = useState("企业用户");

  useEffect(() => {
    let isMounted = true;

    const checkAuthAndRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth/company", { replace: true });
          return;
        }

        // 验证用户角色
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (!isMounted) return;

        // 严格角色验证 - 只允许company访问
        if (roleData?.role === "jobseeker") {
          toast({
            title: "权限错误",
            description: "求职者请访问求职者控制台",
            variant: "destructive",
          });
          navigate("/jobseeker/dashboard", { replace: true });
          return;
        } else if (roleData?.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
          return;
        } else if (roleData?.role !== "company") {
          // 如果没有角色或角色不匹配
          toast({
            title: "权限错误",
            description: "您没有访问企业控制台的权限",
            variant: "destructive",
          });
          navigate("/auth/company", { replace: true });
          return;
        }

        setAuthChecked(true);
        
        // 获取企业名称
        const { data: profileData } = await supabase
          .from("company_profiles")
          .select("company_name")
          .eq("user_id", session.user.id)
          .maybeSingle();
        
        if (profileData?.company_name) {
          setCompanyName(profileData.company_name);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/auth/company", { replace: true });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuthAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/auth/company", { replace: true });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "已退出登录" });
    navigate("/", { replace: true });
  };

  // 显示加载状态
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="w-8 h-8" />
          <p className="text-muted-foreground">验证身份中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link to="/company/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl hidden sm:block">JobLink</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent hidden sm:block">企业版</span>
          </Link>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            {/* Top Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              {topNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center">
                3
              </span>
            </Button>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Building2 className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:block">{companyName}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/company/account-settings")}>
                  <Users className="w-4 h-4 mr-2" />
                  账号设置
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="p-4 space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
              <div className="pt-4 border-t">
                <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleLogout}>
                  <LogOut className="w-5 h-5 mr-3" />
                  退出登录
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r bg-card sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Quick Post Button */}
          <div className="p-4 border-t">
            <Button className="w-full" onClick={() => navigate("/company/jobs/new")}>
              <Briefcase className="w-4 h-4 mr-2" />
              快速发布职位
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
