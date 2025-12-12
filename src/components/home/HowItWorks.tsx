import { Search, FileText, Send, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "搜索职位",
    description: "浏览数万个优质职位，使用智能筛选找到最适合您的机会",
  },
  {
    icon: FileText,
    title: "完善简历",
    description: "创建专业简历，展示您的技能和经验，让企业更了解您",
  },
  {
    icon: Send,
    title: "投递申请",
    description: "一键投递简历，同时收到企业主动发来的招聘邀请",
  },
  {
    icon: CheckCircle,
    title: "获得面试",
    description: "追踪申请状态，准备面试，成功入职理想公司",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            如何<span className="text-gradient">使用</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            简单四步，开启您的求职之旅
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative text-center animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}
              
              {/* Step number */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-card border-2 border-primary/20 flex items-center justify-center shadow-lg">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
