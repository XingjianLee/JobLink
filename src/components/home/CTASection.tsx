import { Button } from "@/components/ui/button";
import { ArrowRight, UserPlus, Building2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
      <section className="py-20 md:py-28 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-primary opacity-95" />

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse-soft" />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="container relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">开启您的职业新篇章</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              准备好开始了吗？
            </h2>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              无论您是求职者还是企业HR，我们都能为您提供最优质的服务
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* For Job Seekers */}
            <div className="relative group">
              <div className="absolute inset-0 bg-white/10 rounded-3xl blur-xl group-hover:bg-white/20 transition-colors duration-500" />
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">我是求职者</h3>
                    <p className="text-white/70 text-sm">寻找理想工作机会</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {["创建专业个人简历", "浏览数万优质职位", "AI智能职位匹配", "一键快速投递"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-white/90">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        {item}
                      </li>
                  ))}
                </ul>

                <Button
                    size="lg"
                    className="w-full bg-white text-primary hover:bg-white/90 font-semibold rounded-xl h-14 text-base group/btn"
                    asChild
                >
                  <Link to="/auth/jobseeker?action=signup">
                    立即注册
                    <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* For Companies */}
            <div className="relative group">
              <div className="absolute inset-0 bg-white/10 rounded-3xl blur-xl group-hover:bg-white/20 transition-colors duration-500" />
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">我是企业</h3>
                    <p className="text-white/70 text-sm">寻找优秀人才</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {["发布招聘职位", "搜索人才简历库", "智能人才推荐", "高效招聘管理"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-white/90">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        {item}
                      </li>
                  ))}
                </ul>

                <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-2 border-white text-white hover:bg-white hover:text-primary font-semibold rounded-xl h-14 text-base group/btn bg-transparent"
                    asChild
                >
                  <Link to="/auth/company?action=signup">
                    企业入驻
                    <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>100%安全保障</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>24小时响应</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>专业团队服务</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>数据隐私保护</span>
            </div>
          </div>
        </div>
      </section>
  );
}
