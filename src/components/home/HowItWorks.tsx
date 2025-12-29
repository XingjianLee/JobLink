import { Search, FileText, Send, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "搜索职位",
    description: "浏览数万个优质职位，使用智能筛选找到最适合您的机会",
    gradient: "gradient-primary",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=300&h=200&fit=crop",
  },
  {
    icon: FileText,
    title: "完善简历",
    description: "创建专业简历，展示您的技能和经验，让企业更了解您",
    gradient: "gradient-cool",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200&fit=crop",
  },
  {
    icon: Send,
    title: "投递申请",
    description: "一键投递简历，同时收到企业主动发来的招聘邀请",
    gradient: "gradient-warm",
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop",
  },
  {
    icon: CheckCircle,
    title: "获得面试",
    description: "追踪申请状态，准备面试，成功入职理想公司",
    gradient: "gradient-nature",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
  },
];

export function HowItWorks() {
  return (
      <section className="py-20 md:py-28 bg-secondary/30 dark:bg-secondary/10 overflow-hidden">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-primary mb-2 block">HOW IT WORKS</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              如何<span className="text-gradient">开始</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              简单四步，开启您的求职之旅
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
                <div
                    key={step.title}
                    className="relative group animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                  )}

                  {/* Card */}
                  <div className="relative bg-card rounded-2xl p-6 border border-border/50 shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                    {/* Image */}
                    <div className="relative h-32 rounded-xl overflow-hidden mb-4">
                      <img
                          src={step.image}
                          alt={step.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                    </div>

                    {/* Icon with number */}
                    <div className="relative flex items-center gap-3 mb-4">
                      <div className={`w-14 h-14 rounded-xl ${step.gradient} flex items-center justify-center shadow-lg`}>
                        <step.icon className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-secondary border-2 border-border flex items-center justify-center text-sm font-bold text-foreground">
                        {index + 1}
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </section>
  );
}
