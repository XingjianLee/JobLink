import { Briefcase, Building2, Users, Award } from "lucide-react";

const stats = [
  {
    icon: Briefcase,
    value: "50,000+",
    label: "在招职位",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Building2,
    value: "10,000+",
    label: "优质企业",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Users,
    value: "1,000,000+",
    label: "注册求职者",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: Award,
    value: "98%",
    label: "用户满意度",
    color: "text-success",
    bgColor: "bg-success/10",
  },
];

export function StatsSection() {
  return (
    <section className="py-12 border-y border-border bg-card/50">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center mb-4`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
