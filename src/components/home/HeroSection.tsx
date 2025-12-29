import { Button } from "@/components/ui/button";
import { Search, MapPin, Zap, TrendingUp, Users, Briefcase, Sparkles } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const popularSearches = ["Java后端开发", "高级产品经理", "数据科学家", "AIGC工程师", "资深运营"];

export function HeroSection() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (location) params.set("location", location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-violet/5 dark:from-primary/10 dark:via-background dark:to-violet/10" />

        {/* Decorative blobs */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-violet/20 rounded-full blur-3xl animate-pulse-soft delay-500" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-rose/10 rounded-full blur-3xl animate-pulse-soft delay-300" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 border border-primary/20 animate-fade-in">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI智能求职 · 洞见未来职场</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight animate-slide-up">
                把握机遇
                <br />
                <span className="text-gradient">成就理想生涯</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-lg animate-slide-up delay-100">
                专注于高价值职位，通过数据与AI驱动，为您精确匹配全球顶尖企业与人才。
              </p>

              {/* Search Box */}
              <div className="bg-card/80 dark:bg-card/60 backdrop-blur-xl rounded-2xl shadow-xl border border-border/50 p-3 animate-slide-up delay-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Keyword Input */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="搜索职位、公司、技术栈"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-secondary/50 dark:bg-secondary/30 border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>

                  {/* Location Input */}
                  <div className="sm:w-40 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="工作城市"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-secondary/50 dark:bg-secondary/30 border-0 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>

                  {/* Search Button */}
                  <Button
                      size="lg"
                      className="h-12 px-8 gradient-primary hover:opacity-90 text-primary-foreground font-semibold rounded-xl transition-all shadow-colored"
                      onClick={handleSearch}
                  >
                    <Search className="w-5 h-5 mr-2" />
                    立即搜索
                  </Button>
                </div>

                {/* Quick Tags */}
                <div className="mt-3 px-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground font-medium">热门标签：</span>
                  {popularSearches.map((search) => (
                      <button
                          key={search}
                          onClick={() => setKeyword(search)}
                          className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-primary/10 dark:hover:bg-primary/20 text-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        {search}
                      </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right content - Visual cards */}
            <div className="hidden lg:block relative h-[520px]">
              {/* Main background image */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                    alt="Team collaboration"
                    className="w-full h-full object-cover opacity-30 dark:opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              </div>

              {/* Stats card */}
              <div className="absolute top-4 right-4 w-72 glass-card rounded-2xl p-6 animate-slide-up delay-200 animate-float">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-foreground">在线精英人才</span>
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>
                <div className="flex items-baseline gap-4">
                  <div>
                    <div className="text-3xl font-bold text-foreground">2,574</div>
                    <div className="text-xs text-muted-foreground">初级</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-foreground">4,131</div>
                    <div className="text-xs text-muted-foreground">中级</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">998</div>
                    <div className="text-xs text-muted-foreground">高级</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">初级</button>
                  <button className="flex-1 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">中级</button>
                  <button className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-md">高级</button>
                </div>
              </div>

              {/* Vacancies card */}
              <div className="absolute top-52 right-24 w-52 glass-card rounded-2xl p-5 animate-slide-up delay-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-foreground">最新职位空缺</span>
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">8,574</span>
                  <span className="text-sm text-success font-medium">+37</span>
                </div>
                <div className="mt-3 flex gap-1">
                  {[40, 65, 45, 80, 55, 70, 60, 85, 50].map((h, i) => (
                      <div
                          key={i}
                          className="flex-1 bg-secondary rounded-full overflow-hidden"
                          style={{ height: '40px' }}
                      >
                        <div
                            className="w-full gradient-primary rounded-full transition-all duration-500"
                            style={{ height: `${h}%`, marginTop: `${100 - h}%` }}
                        />
                      </div>
                  ))}
                </div>
              </div>

              {/* Match rate card */}
              <div className="absolute bottom-24 left-4 w-60 glass-card rounded-2xl p-5 animate-slide-up delay-400">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-foreground">AI 匹配指数</span>
                  <Users className="w-4 h-4 text-violet" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                          cx="40"
                          cy="40"
                          r="35"
                          fill="none"
                          className="stroke-secondary"
                          strokeWidth="6"
                      />
                      <circle
                          cx="40"
                          cy="40"
                          r="35"
                          fill="none"
                          className="stroke-violet"
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${0.86 * 220} 220`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-foreground">86%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">高潜力</div>
                    <div className="text-xs text-muted-foreground">基于技能与偏好</div>
                  </div>
                </div>
              </div>

              {/* Job preview card */}
              <div className="absolute bottom-4 right-4 w-64 glass-card rounded-2xl p-4 animate-slide-up delay-500">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-cool flex items-center justify-center text-primary-foreground font-bold text-lg">
                    T
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">全栈开发工程师</div>
                    <div className="text-sm text-muted-foreground">腾达科技</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">25-40K</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">全职</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-violet/10 text-violet font-medium">深圳</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">发布于2小时前</span>
                  <div className="flex items-center gap-1">
                    <div className="relative w-8 h-8">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="16" cy="16" r="14" fill="none" className="stroke-secondary" strokeWidth="2" />
                        <circle cx="16" cy="16" r="14" fill="none" className="stroke-success" strokeWidth="2" strokeDasharray={`${0.92 * 88} 88`} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-success">92%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
