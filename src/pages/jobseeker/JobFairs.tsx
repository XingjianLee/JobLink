import { JobseekerLayout } from "@/components/layout/JobseekerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Building2,
  Users,
  Clock,
  ExternalLink,
} from "lucide-react";

const jobFairs = [
  {
    id: 1,
    title: "2024春季大型综合人才招聘会",
    location: "北京国际会议中心",
    address: "北京市朝阳区北辰东路8号",
    date: "2024-02-15",
    time: "09:00 - 16:00",
    companies: 200,
    positions: 5000,
    status: "upcoming",
    organizer: "北京市人力资源和社会保障局",
  },
  {
    id: 2,
    title: "互联网/科技行业专场招聘会",
    location: "上海浦东新区人才市场",
    address: "上海市浦东新区张杨路500号",
    date: "2024-02-20",
    time: "09:30 - 17:00",
    companies: 80,
    positions: 2000,
    status: "upcoming",
    organizer: "上海市就业促进中心",
  },
  {
    id: 3,
    title: "高校毕业生专场招聘会",
    location: "广州天河体育中心",
    address: "广州市天河区天河路299号",
    date: "2024-02-25",
    time: "09:00 - 15:00",
    companies: 150,
    positions: 3500,
    status: "upcoming",
    organizer: "广州市人才服务中心",
  },
  {
    id: 4,
    title: "制造业人才招聘会",
    location: "深圳会展中心",
    address: "深圳市福田区福华三路",
    date: "2024-03-01",
    time: "08:30 - 16:30",
    companies: 120,
    positions: 4000,
    status: "upcoming",
    organizer: "深圳市人力资源开发协会",
  },
  {
    id: 5,
    title: "金融行业精英招聘会",
    location: "杭州国际博览中心",
    address: "杭州市萧山区奔竞大道353号",
    date: "2024-03-10",
    time: "09:00 - 17:00",
    companies: 60,
    positions: 1500,
    status: "upcoming",
    organizer: "杭州市金融人才交流中心",
  },
];

const cities = ["全部城市", "北京", "上海", "广州", "深圳", "杭州", "成都", "武汉"];

export default function JobFairs() {
  return (
    <JobseekerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            招聘会信息
          </h1>
          <p className="text-muted-foreground mt-1">
            全国各地招聘会信息汇总，为您提供更多求职机会
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <Badge
              key={city}
              variant={city === "全部城市" ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {city}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold text-primary">15</div>
              <div className="text-sm text-muted-foreground">本月招聘会</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold text-primary">610+</div>
              <div className="text-sm text-muted-foreground">参会企业</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold text-primary">16000+</div>
              <div className="text-sm text-muted-foreground">招聘岗位</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center">
              <div className="text-2xl font-bold text-primary">8</div>
              <div className="text-sm text-muted-foreground">覆盖城市</div>
            </CardContent>
          </Card>
        </div>

        {/* Job Fairs List */}
        <div className="space-y-4">
          {jobFairs.map((fair) => (
            <Card key={fair.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{fair.title}</h3>
                      <Badge variant="secondary">即将开始</Badge>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {fair.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        {fair.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        {fair.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        {fair.companies} 家企业
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {fair.positions} 个岗位
                      </span>
                      <span className="text-muted-foreground">
                        主办方：{fair.organizer}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      查看详情
                    </Button>
                    <Button size="sm">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      立即报名
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </JobseekerLayout>
  );
}
