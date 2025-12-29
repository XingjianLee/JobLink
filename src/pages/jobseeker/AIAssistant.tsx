import { useState } from "react";
import { JobseekerLayout } from "@/components/layout/JobseekerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  FileText, 
  Search, 
  ArrowRight, 
  CheckCircle2,
  Loader2,
  Wand2,
  Target,
  Lightbulb
} from "lucide-react";
import { ResumeBuilder } from "@/components/jobseeker/ResumeBuilder";
import { SmartJobRecommendations } from "@/components/jobseeker/SmartJobRecommendations";

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState("resume");

  return (
    <JobseekerLayout>
      <div className="space-y-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-primary/20 p-8 md:p-12">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                AI 求职助手
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-2xl">
              智能生成专业简历，精准推荐匹配职位，让您的求职之路更加顺畅
            </p>
          </div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">智能简历生成</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  通过引导式问答，AI将根据您的个人信息、工作经历和技能，自动生成专业、个性化的简历
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>多步骤引导，轻松填写</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>智能优化简历内容</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>支持多种简历模板</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">智能职位推荐</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  基于您的个人资料、技能和求职偏好，AI智能分析并推荐最适合您的职位机会
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>个性化匹配算法</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>实时职位更新</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>匹配度评分展示</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14">
            <TabsTrigger value="resume" className="gap-2 text-base">
              <Wand2 className="w-5 h-5" />
              简历生成
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="gap-2 text-base">
              <Target className="w-5 h-5" />
              职位推荐
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resume" className="mt-6">
            <ResumeBuilder />
          </TabsContent>

          <TabsContent value="recommendations" className="mt-6">
            <SmartJobRecommendations />
          </TabsContent>
        </Tabs>
      </div>
    </JobseekerLayout>
  );
}

