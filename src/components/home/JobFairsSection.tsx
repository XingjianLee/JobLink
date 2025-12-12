import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Users, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

// 模拟数据
const upcomingJobFairs = [
  {
    id: "1",
    title: "2024春季大型人才招聘会",
    location: "北京国际会议中心",
    startTime: new Date("2024-03-15T09:00:00"),
    endTime: new Date("2024-03-15T17:00:00"),
    organizer: "北京市人力资源和社会保障局",
    companies: 200,
    status: "upcoming" as const,
  },
  {
    id: "2",
    title: "互联网行业专场招聘会",
    location: "上海世博展览馆",
    startTime: new Date("2024-03-20T10:00:00"),
    endTime: new Date("2024-03-20T16:00:00"),
    organizer: "上海市人才服务中心",
    companies: 80,
    status: "upcoming" as const,
  },
  {
    id: "3",
    title: "高校毕业生双选会",
    location: "深圳人才大厦",
    startTime: new Date("2024-03-25T09:30:00"),
    endTime: new Date("2024-03-25T15:30:00"),
    organizer: "深圳市人才交流中心",
    companies: 150,
    status: "upcoming" as const,
  },
];

export function JobFairsSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">近期招聘会</h2>
            <p className="text-muted-foreground">线下面对面交流，把握求职机会</p>
          </div>
          <Button variant="ghost" className="hidden md:flex" asChild>
            <Link to="/job-fairs">
              查看全部
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>

        {/* Job Fairs List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {upcomingJobFairs.map((fair, index) => (
            <Card
              key={fair.id}
              className="p-6 card-hover cursor-pointer group overflow-hidden relative"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className="tag tag-accent">即将开始</span>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-lg mb-4 pr-20 group-hover:text-primary transition-colors">
                {fair.title}
              </h3>

              {/* Info */}
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-medium">
                      {format(fair.startTime, "yyyy年M月d日 EEEE", { locale: zhCN })}
                    </div>
                    <div className="text-muted-foreground">
                      {format(fair.startTime, "HH:mm")} - {format(fair.endTime, "HH:mm")}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span>{fair.location}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-primary font-medium">{fair.companies}家企业参展</span>
                </div>
              </div>

              {/* Organizer */}
              <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                主办方：{fair.organizer}
              </div>
            </Card>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" asChild>
            <Link to="/job-fairs">
              查看全部招聘会
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
