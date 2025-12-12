import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedCompanies } from "@/components/home/FeaturedCompanies";
import { JobFairsSection } from "@/components/home/JobFairsSection";
import { CTASection } from "@/components/home/CTASection";
import { StatsSection } from "@/components/home/StatsSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, role, loading, getDashboardPath } = useAuth();

  useEffect(() => {
    // 已登录用户自动跳转到对应的dashboard
    if (!loading && isAuthenticated && role) {
      navigate(getDashboardPath(), { replace: true });
    }
  }, [loading, isAuthenticated, role, navigate, getDashboardPath]);

  // 显示加载状态（可选，避免闪烁）
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // 已登录用户会被重定向，这里只渲染给未登录用户
  if (isAuthenticated && role) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <HowItWorks />
        <FeaturedCompanies />
        <JobFairsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
