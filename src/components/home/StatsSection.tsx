import { Briefcase, Building2, Users, Award } from "lucide-react";

const stats = [
  {
    icon: Briefcase,
    value: "50,000+",
    label: "在招职位",
    gradient: "gradient-primary",
    iconColor: "text-primary-foreground",
  },
  {
    icon: Building2,
    value: "10,000+",
    label: "优质企业",
    gradient: "gradient-cool",
    iconColor: "text-primary-foreground",
  },
  {
    icon: Users,
    value: "1,000,000+",
    label: "注册求职者",
    gradient: "gradient-warm",
    iconColor: "text-primary-foreground",
  },
  {
    icon: Award,
    value: "98%",
    label: "用户满意度",
    gradient: "gradient-nature",
    iconColor: "text-primary-foreground",
  },
];

export function StatsSection() {
  return (
      <section className="py-16 border-y border-border bg-secondary/30 dark:bg-secondary/10">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
                <div
                    key={stat.label}
                    className="flex flex-col items-center text-center animate-slide-up group"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-16 h-16 rounded-2xl ${stat.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-8 h-8 ${stat.iconColor}`} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold mb-1 text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
            ))}
          </div>
        </div>
      </section>
  );
}
