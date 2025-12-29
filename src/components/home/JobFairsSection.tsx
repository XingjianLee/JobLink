import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

const upcomingJobFairs = [
  {
    id: "1",
    title: "2024春季大型人才招聘会",
    location: "北京国际会议中心",
    startTime: new Date("2024-03-15T09:00:00"),
    endTime: new Date("2024-03-15T17:00:00"),
    organizer: "北京市人力资源和社会保障局",
    companies: 200,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
    gradient: "from-primary/80 to-violet/80",
  },
  {
    id: "2",
    title: "互联网行业专场招聘会",
    location: "上海世博展览馆",
    startTime: new Date("2024-03-20T10:00:00"),
    endTime: new Date("2024-03-20T16:00:00"),
    organizer: "上海市人才服务中心",
    companies: 80,
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600&h=400&fit=crop",
    gradient: "from-cyan/80 to-emerald/80",
  },
  {
    id: "3",
    title: "高校毕业生双选会",
    location: "深圳人才大厦",
    startTime: new Date("2024-03-25T09:30:00"),
    endTime: new Date("2024-03-25T15:30:00"),
    organizer: "深圳市人才交流中心",
    companies: 150,
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&h=400&fit=crop",
    gradient: "from-rose/80 to-amber/80",
  },
];

export function JobFairsSection() {
  return (
      <section className="py-20 md:py-28">
        <div className="container">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-sm font-semibold text-primary mb-2 block">UPCOMING EVENTS</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">近期招聘会</h2>
              <p className="text-muted-foreground">线下面对面交流，把握求职机会</p>
            </div>
            <Button variant="ghost" className="hidden md:flex group" asChild>
              <Link to="/job-fairs">
                查看全部
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Job Fairs List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {upcomingJobFairs.map((fair, index) => (
                <Card
                    key={fair.id}
                    className="overflow-hidden card-hover cursor-pointer group border-border/50 bg-card"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image Header */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                        src={fair.image}
                        alt={fair.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${fair.gradient} mix-blend-multiply`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-success/90 text-success-foreground backdrop-blur-sm">
                    即将开始
                  </span>
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {fair.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {format(fair.startTime, "yyyy年M月d日 EEEE", { locale: zhCN })}
                          </div>
                          <div className="text-muted-foreground">
                            {format(fair.startTime, "HH:mm")} - {format(fair.endTime, "HH:mm")}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-4 h-4 text-violet" />
                        </div>
                        <span className="text-foreground">{fair.location}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                          <Users className="w-4 h-4 text-success" />
                        </div>
                        <span className="text-success font-semibold">{fair.companies}家企业参展</span>
                      </div>
                    </div>

                    {/* Organizer */}
                    <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                      主办方：{fair.organizer}
                    </div>
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
