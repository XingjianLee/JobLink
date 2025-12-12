import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, Building2 } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-primary text-primary-foreground overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* For Job Seekers */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/10 mb-6">
              <UserPlus className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">我是求职者</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto lg:mx-0">
              创建你的个人简历，让心仪的企业主动找到你。浏览数万个职位，一键投递，快速获得面试机会。
            </p>
            <Button
              size="lg"
              variant="hero-outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link to="/auth/jobseeker?action=signup">
                立即注册
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* For Companies */}
          <div className="text-center lg:text-left lg:border-l lg:border-primary-foreground/20 lg:pl-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/10 mb-6">
              <Building2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">我是企业</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto lg:mx-0">
              发布职位，精准匹配人才。搜索人才库，主动出击。高效招聘，降低用人成本。
            </p>
            <Button
              size="lg"
              variant="hero-outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link to="/auth/company?action=signup">
                企业入驻
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
