import { JobseekerLayout } from "@/components/layout/JobseekerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, TrendingUp, Clock, Eye, ChevronRight } from "lucide-react";

const articles = [
  {
    id: 1,
    title: "2024年最受欢迎的十大技能",
    category: "职场趋势",
    summary: "随着科技发展，人工智能、数据分析等技能越来越受到企业青睐...",
    date: "2024-01-15",
    views: 2345,
    isHot: true,
  },
  {
    id: 2,
    title: "面试技巧：如何给HR留下深刻印象",
    category: "求职技巧",
    summary: "面试是求职过程中最关键的环节，本文将分享一些实用的面试技巧...",
    date: "2024-01-14",
    views: 1890,
    isHot: true,
  },
  {
    id: 3,
    title: "职场新人必读：入职第一个月应该做什么",
    category: "职场经验",
    summary: "入职第一个月对于职场新人来说至关重要，它往往决定了你在公司的发展方向...",
    date: "2024-01-13",
    views: 1567,
    isHot: false,
  },
  {
    id: 4,
    title: "如何写一份出色的简历",
    category: "求职技巧",
    summary: "简历是求职的敲门砖，一份好的简历能让你脱颖而出...",
    date: "2024-01-12",
    views: 2100,
    isHot: false,
  },
  {
    id: 5,
    title: "远程办公时代：如何保持高效工作",
    category: "职场经验",
    summary: "远程办公已成为新常态，如何在家也能保持高效的工作状态...",
    date: "2024-01-11",
    views: 980,
    isHot: false,
  },
  {
    id: 6,
    title: "薪资谈判技巧：如何争取到满意的薪水",
    category: "求职技巧",
    summary: "薪资谈判是求职过程中的重要环节，掌握技巧才能获得满意的offer...",
    date: "2024-01-10",
    views: 1456,
    isHot: true,
  },
];

const categories = [
  { name: "全部", count: 128 },
  { name: "职场趋势", count: 32 },
  { name: "求职技巧", count: 45 },
  { name: "职场经验", count: 38 },
  { name: "行业资讯", count: 13 },
];

export default function CareerGuide() {
  return (
    <JobseekerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            就业指南
          </h1>
          <p className="text-muted-foreground mt-1">
            职场资讯、求职技巧、行业热点，助你职场成功
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">资讯分类</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((cat) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
                  >
                    <span className="text-sm">{cat.name}</span>
                    <Badge variant="secondary">{cat.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Hot Topics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-destructive" />
                  热门话题
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {["AI时代的求职策略", "年终奖那些事", "跳槽的最佳时机", "职场沟通技巧"].map(
                  (topic, i) => (
                    <div
                      key={topic}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors"
                    >
                      <span className="w-5 h-5 rounded bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      {topic}
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Articles */}
          <div className="lg:col-span-3 space-y-4">
            {articles.map((article) => (
              <Card
                key={article.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{article.category}</Badge>
                        {article.isHot && (
                          <Badge variant="destructive" className="text-xs">
                            热门
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views} 阅读
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </JobseekerLayout>
  );
}
