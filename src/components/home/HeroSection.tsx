import { Button } from "@/components/ui/button";
import { Search, MapPin, Zap, TrendingUp, Users, Briefcase } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 调整热门搜索关键词，更贴近招聘主题
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

        {/* 蓝色系背景与低饱和度渐变叠加 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-background to-blue-200/30" />

        {/* 蓝色系装饰光斑 */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl opacity-50 animate-pulse-soft" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl opacity-50 animate-pulse-soft delay-500" />

        {/* 网格图案叠加（保持低对比度） */}
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* 左侧内容 */}
            <div className="space-y-8">
              {/* Badge - 蓝色系强调 */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-200/50 border border-blue-400/50 animate-fade-in">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">AI智能求职 · 洞见未来职场</span>
              </div>

              {/* Main Heading - 突出蓝色渐变 */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight animate-slide-up">
                把握机遇
                <br />
                {/* text-gradient 应定义为低饱和度的蓝色到深蓝色渐变 */}
                <span className="text-blue-gradient">成就理想生涯</span>
              </h1>

              <p className="text-lg md:text-xl text-foreground/70 max-w-lg animate-slide-up delay-100">
                专注于高价值职位，通过数据与AI驱动，为您精确匹配全球顶尖企业与人才。
              </p>

              {/* Search Box */}
              <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100 p-3 animate-slide-up delay-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Keyword Input */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                        type="text"
                        placeholder="搜索职位、公司、技术栈"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-blue-50/70 border-0 text-gray-800 placeholder:text-blue-400 focus:ring-2 focus:ring-blue-300 transition-all duration-300"
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>

                  {/* Location Input */}
                  <div className="sm:w-40 relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                        type="text"
                        placeholder="工作城市"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-blue-50/70 border-0 text-gray-800 placeholder:text-blue-400 focus:ring-2 focus:ring-blue-300 transition-all duration-300"
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>

                  {/* Search Button - 蓝色主题按钮 */}
                  <Button
                      size="lg"
                      className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                      onClick={handleSearch}
                  >
                    <Search className="w-5 h-5 mr-2" />
                    立即搜索
                  </Button>
                </div>

                {/* Quick Tags - 蓝色系标签 */}
                <div className="mt-3 px-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-blue-500 font-medium">热门标签：</span>
                  {popularSearches.map((search) => (
                      <button
                          key={search}
                          onClick={() => setKeyword(search)}
                          className="text-xs px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors cursor-pointer"
                      >
                        {search}
                      </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 右侧内容 - 蓝色的求职主题背景图和浮动卡片 */}
            <div className="hidden lg:block relative h-[480px]">
              <div className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-80"
                   style={{
                     // 请替换为实际的背景图片 URL，或使用生成的图片
                     backgroundImage: "url('/fig/hero.jpg')",
                   }}
              >
                {/*  */}
                <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[1px]"></div> {/* 增加低饱和度滤镜 */}
              </div>

              {/* Main stats card - 使用浅蓝玻璃效果 */}
              <div className="absolute top-0 right-0 w-72 backdrop-blur-md bg-white/20 border border-white/50 rounded-2xl p-6 shadow-2xl animate-slide-up delay-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-blue-900/80">在线精英人才</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-200 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-baseline gap-4">
                  <div>
                    <div className="text-3xl font-bold text-blue-800">2,574</div>
                    <div className="text-xs text-blue-600/70">初级</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-800">4,131</div>
                    <div className="text-xs text-blue-600/70">中级</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600">998</div>
                    <div className="text-xs text-blue-600/70">高级</div>
                  </div>
                </div>
                {/* 蓝色系按钮组 */}
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 py-2 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium">初级</button>
                  <button className="flex-1 py-2 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium">中级</button>
                  <button className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium shadow-md">高级</button>
                </div>
              </div>

              {/* Vacancies card - 浅蓝玻璃效果 */}
              <div className="absolute top-48 right-20 w-48 backdrop-blur-md bg-white/20 border border-white/50 rounded-2xl p-5 shadow-2xl animate-slide-up delay-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-blue-900/80">最新职位空缺</span>
                  <Briefcase className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-blue-800">8,574</span>
                  <span className="text-sm text-blue-600 font-medium">+37</span>
                </div>
                {/* 蓝色系柱状图 */}
                <div className="mt-3 flex gap-1">
                  {[40, 65, 45, 80, 55, 70, 60, 85, 50].map((h, i) => (
                      <div
                          key={i}
                          className="flex-1 bg-blue-300/30 rounded-full overflow-hidden"
                          style={{ height: '40px' }}
                      >
                        <div
                            className="w-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ height: `${h}%`, marginTop: `${100 - h}%` }}
                        />
                      </div>
                  ))}
                </div>
              </div>

              {/* Match rate card - 浅蓝玻璃效果 */}
              <div className="absolute bottom-20 left-0 w-56 backdrop-blur-md bg-white/20 border border-white/50 rounded-2xl p-5 shadow-2xl animate-slide-up delay-400">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-blue-900/80">AI 匹配指数</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                          cx="40"
                          cy="40"
                          r="35"
                          fill="none"
                          stroke="rgb(209, 213, 219, 0.5)" // light gray-blue secondary
                          strokeWidth="6"
                      />
                      {/* 蓝色进度条 */}
                      <circle
                          cx="40"
                          cy="40"
                          r="35"
                          fill="none"
                          stroke="hsl(210 40% 50%)" // blue accent color
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${0.86 * 220} 220`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-blue-800">86%</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-800">高潜力</div>
                    <div className="text-xs text-blue-600/70">基于技能与偏好</div>
                  </div>
                </div>
              </div>

              {/* Floating job card preview - 浅蓝玻璃效果 */}
              <div className="absolute bottom-0 right-0 w-64 backdrop-blur-md bg-white/20 border border-white/50 rounded-2xl p-4 shadow-2xl animate-slide-up delay-500">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                    T
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-blue-800">全栈开发工程师</div>
                    <div className="text-sm text-blue-600/80">腾达科技 (Tencent)</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {/* 蓝色系标签 */}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 font-medium">25-40K</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 font-medium">全职</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 font-medium">深圳</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-blue-600/70">发布于2小时前</span>
                  <div className="flex items-center gap-1">
                    <div className="relative w-8 h-8">
                      <svg className="w-full h-full -rotate-90">
                        <circle cx="16" cy="16" r="14" fill="none" stroke="rgb(209, 213, 219, 0.5)" strokeWidth="2" />
                        {/* 蓝色进度条 */}
                        <circle cx="16" cy="16" r="14" fill="none" stroke="hsl(210 40% 50%)" strokeWidth="2" strokeDasharray={`${0.92 * 88} 88`} />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-blue-800">92%</span>
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