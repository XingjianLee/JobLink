import { JobseekerLayout } from "@/components/layout/JobseekerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  MapPin,
  DollarSign,
  Briefcase,
  Phone,
  Star,
} from "lucide-react";

const partTimeJobs = [
  {
    id: 1,
    title: "周末促销员",
    company: "某知名超市",
    location: "北京市朝阳区",
    hourlyRate: "25-35",
    workHours: "周六日 9:00-18:00",
    requirements: "形象好，沟通能力强",
    category: "促销",
    isUrgent: true,
  },
  {
    id: 2,
    title: "家教-高中数学",
    company: "个人雇主",
    location: "上海市浦东新区",
    hourlyRate: "150-200",
    workHours: "每周2-3次，每次2小时",
    requirements: "985/211本科及以上，有教学经验优先",
    category: "家教",
    isUrgent: false,
  },
  {
    id: 3,
    title: "外卖骑手",
    company: "某外卖平台",
    location: "广州市天河区",
    hourlyRate: "20-50",
    workHours: "自由安排，午餐晚餐高峰期",
    requirements: "有电动车，熟悉路况",
    category: "配送",
    isUrgent: true,
  },
  {
    id: 4,
    title: "翻译（英语）",
    company: "某翻译公司",
    location: "线上远程",
    hourlyRate: "100-150",
    workHours: "按项目计算",
    requirements: "英语专业八级或同等水平",
    category: "翻译",
    isUrgent: false,
  },
  {
    id: 5,
    title: "活动执行",
    company: "某活动策划公司",
    location: "深圳市南山区",
    hourlyRate: "30-50",
    workHours: "根据活动安排",
    requirements: "有责任心，能吃苦耐劳",
    category: "活动",
    isUrgent: false,
  },
  {
    id: 6,
    title: "服务员",
    company: "某连锁餐饮",
    location: "杭州市西湖区",
    hourlyRate: "22-28",
    workHours: "晚班 17:00-22:00",
    requirements: "服务意识强，有健康证",
    category: "餐饮",
    isUrgent: true,
  },
  {
    id: 7,
    title: "平面设计",
    company: "某设计工作室",
    location: "线上远程",
    hourlyRate: "80-120",
    workHours: "按项目计算",
    requirements: "熟练使用PS、AI等设计软件",
    category: "设计",
    isUrgent: false,
  },
  {
    id: 8,
    title: "问卷调查员",
    company: "某市场调研公司",
    location: "成都市锦江区",
    hourlyRate: "20-30",
    workHours: "周末全天",
    requirements: "普通话标准，善于沟通",
    category: "调研",
    isUrgent: false,
  },
];

const categories = [
  "全部",
  "促销",
  "家教",
  "配送",
  "翻译",
  "活动",
  "餐饮",
  "设计",
  "调研",
];

export default function PartTimeJobs() {
  return (
    <JobseekerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary" />
            兼职天地
          </h1>
          <p className="text-muted-foreground mt-1">
            海量兼职信息，灵活工作时间，轻松赚取额外收入
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={cat === "全部" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {cat}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">兼职岗位</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">合作商家</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold text-primary">20-200</div>
              <div className="text-sm text-muted-foreground">时薪范围(元)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold text-primary">日结</div>
              <div className="text-sm text-muted-foreground">结算方式</div>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {partTimeJobs.map((job) => (
            <Card
              key={job.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{job.title}</h3>
                      {job.isUrgent && (
                        <Badge variant="destructive" className="text-xs">
                          急招
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{job.company}</p>
                  </div>
                  <Badge variant="secondary">{job.category}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1 text-primary font-medium">
                    <DollarSign className="w-4 h-4" />
                    {job.hourlyRate} 元/小时
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                    <Clock className="w-4 h-4" />
                    {job.workHours}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground border-t border-border pt-3">
                  要求：{job.requirements}
                </p>

                <div className="flex gap-2 pt-1">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Star className="w-4 h-4 mr-1" />
                    收藏
                  </Button>
                  <Button size="sm" className="flex-1">
                    <Phone className="w-4 h-4 mr-1" />
                    联系雇主
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </JobseekerLayout>
  );
}
