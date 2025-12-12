import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Users, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

// 模拟数据
const featuredCompanies = [
  {
    id: "1",
    name: "字节跳动",
    industry: "互联网/科技",
    size: "1000+",
    location: "北京",
    openPositions: 128,
    logo: "https://cdn.worldvectorlogo.com/logos/tiktok-logo-2-3.svg",
    description: "激发创造，丰富生活",
  },
  {
    id: "2",
    name: "阿里巴巴",
    industry: "电子商务",
    size: "1000+",
    location: "杭州",
    openPositions: 89,
    logo: "https://cdn.worldvectorlogo.com/logos/taobao-new-flat-design.svg",
    description: "让天下没有难做的生意",
  },
  {
    id: "3",
    name: "腾讯",
    industry: "互联网/游戏",
    size: "1000+",
    location: "深圳",
    openPositions: 156,
    logo: "https://cdn.worldvectorlogo.com/logos/tencent-qq.svg",
    description: "用户为本，科技向善",
  },
  {
    id: "4",
    name: "美团",
    industry: "本地生活",
    size: "1000+",
    location: "北京",
    openPositions: 67,
    logo: "https://cdn.worldvectorlogo.com/logos/meituan-deliver.svg",
    description: "帮大家吃得更好，生活更好",
  },
];

export function FeaturedCompanies() {
  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">名企招聘</h2>
            <p className="text-muted-foreground">优质企业，优质机会</p>
          </div>
          <Button variant="ghost" className="hidden md:flex" asChild>
            <Link to="/companies">
              查看全部
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCompanies.map((company, index) => (
            <Card
              key={company.id}
              className="p-6 card-hover cursor-pointer group text-center"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Logo */}
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden bg-secondary shadow-md group-hover:shadow-lg transition-shadow">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name & Industry */}
              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                {company.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{company.industry}</p>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {company.description}
              </p>

              {/* Meta Info */}
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {company.location}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {company.size}人
                </div>
              </div>

              {/* Open Positions */}
              <div className="flex items-center justify-center gap-1 text-primary font-medium">
                <Briefcase className="w-4 h-4" />
                <span>{company.openPositions}个在招职位</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" asChild>
            <Link to="/companies">
              查看全部企业
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
