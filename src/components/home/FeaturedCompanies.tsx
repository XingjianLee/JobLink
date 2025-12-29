import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Users, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

const featuredCompanies = [
  {
    id: "1",
    name: "字节跳动",
    industry: "互联网/科技",
    size: "1000+",
    location: "北京",
    openPositions: 128,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
    description: "激发创造，丰富生活",
    color: "from-rose/20 to-amber/20",
  },
  {
    id: "2",
    name: "阿里巴巴",
    industry: "电子商务",
    size: "1000+",
    location: "杭州",
    openPositions: 89,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
    description: "让天下没有难做的生意",
    color: "from-amber/20 to-emerald/20",
  },
  {
    id: "3",
    name: "腾讯",
    industry: "互联网/游戏",
    size: "1000+",
    location: "深圳",
    openPositions: 156,
    image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=400&h=300&fit=crop",
    description: "用户为本，科技向善",
    color: "from-primary/20 to-violet/20",
  },
  {
    id: "4",
    name: "美团",
    industry: "本地生活",
    size: "1000+",
    location: "北京",
    openPositions: 67,
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&h=300&fit=crop",
    description: "帮大家吃得更好，生活更好",
    color: "from-cyan/20 to-primary/20",
  },
];

export function FeaturedCompanies() {
  return (
      <section className="py-20 md:py-28">
        <div className="container">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-sm font-semibold text-primary mb-2 block">FEATURED COMPANIES</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">名企招聘</h2>
              <p className="text-muted-foreground">与全球顶尖企业共创未来</p>
            </div>
            <Button variant="ghost" className="hidden md:flex group" asChild>
              <Link to="/companies">
                查看全部
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCompanies.map((company, index) => (
                <Card
                    key={company.id}
                    className="overflow-hidden card-hover cursor-pointer group border-border/50 bg-card"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Image */}
                  <div className={`relative h-40 overflow-hidden bg-gradient-to-br ${company.color}`}>
                    <img
                        src={company.image}
                        alt={company.name}
                        className="w-full h-full object-cover mix-blend-overlay opacity-80 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                        {company.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{company.industry}</p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {company.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
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
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <span>{company.openPositions}个在招职位</span>
                    </div>
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
