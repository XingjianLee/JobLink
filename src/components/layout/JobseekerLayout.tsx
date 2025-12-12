import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  LayoutDashboard,
  User,
  FileText,
  Send,
  Mail,
  Bookmark,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Spinner } from "@/components/ui/spinner";

interface DashboardLayoutProps {
  children: ReactNode;
}

const sidebarLinks = [
  { href: "/jobseeker/dashboard", label: "概览", icon: LayoutDashboard },
  { href: "/jobseeker/search", label: "搜索职位", icon: Search },
  { href: "/jobseeker/applications", label: "我的投递", icon: Send },
  { href: "/jobseeker/invitations", label: "企业邀约", icon: Mail },
  { href: "/jobseeker/bookmarks", label: "收藏职位", icon: Bookmark },
  { href: "/jobseeker/resume", label: "简历管理", icon: FileText },
  { href: "/jobseeker/profile", label: "个人资料", icon: User },
];

export function JobseekerLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAuthAndRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth/jobseeker", { replace: true });
          return;
        }

        // 验证用户角色
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (!isMounted) return;

        // 严格角色验证 - 只允许jobseeker访问
        if (roleData?.role === "company") {
          toast({
            title: "权限错误",
            description: "企业用户请访问企业控制台",
            variant: "destructive",
          });
          navigate("/company/dashboard", { replace: true });
          return;
        } else if (roleData?.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
          return;
        }

        setUser(session.user);
        setAuthChecked(true);
        fetchProfile(session.user.id);
      } catch (error) {
        console.error("Auth check error:", error);
        navigate("/auth/jobseeker", { replace: true });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuthAndRole();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/auth/jobseeker", { replace: true });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("jobseeker_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (data) {
      setProfile(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "已退出登录",
      description: "期待您的下次访问",
    });
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

  const currentPage = sidebarLinks.find(link => location.pathname === link.href);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r border-border">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/jobseeker/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold">
              Job<span className="text-primary">Link</span>
            </span>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{profile?.full_name || "用户"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            退出登录
          </Button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-foreground/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link to="/jobseeker/dashboard" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold">
              Job<span className="text-primary">Link</span>
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            退出登录
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center px-4 lg:px-8">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-secondary mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link to="/jobseeker/dashboard" className="text-muted-foreground hover:text-foreground">
              求职者中心
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{currentPage?.label || "概览"}</span>
          </div>

          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-1 mx-auto">
            <Link
              to="/jobseeker/career-guide"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === "/jobseeker/career-guide"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              就业指南
            </Link>
            <Link
              to="/jobseeker/job-fairs"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === "/jobseeker/job-fairs"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              招聘会信息
            </Link>
            <Link
              to="/jobseeker/part-time"
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === "/jobseeker/part-time"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              兼职天地
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
