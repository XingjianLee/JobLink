import { Link } from "react-router-dom";
import { Briefcase, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  seekers: [
    { label: "职位搜索", href: "/jobs" },
    { label: "简历管理", href: "/jobseeker/resume" },
    { label: "职场资讯", href: "/articles" },
    { label: "招聘会", href: "/job-fairs" },
  ],
  companies: [
    { label: "发布职位", href: "/company/post-job" },
    { label: "人才搜索", href: "/company/talents" },
    { label: "企业中心", href: "/company/dashboard" },
    { label: "招聘解决方案", href: "/solutions" },
  ],
  about: [
    { label: "关于我们", href: "/about" },
    { label: "联系我们", href: "/contact" },
    { label: "用户协议", href: "/terms" },
    { label: "隐私政策", href: "/privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold">
                Job<span className="text-primary">Link</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-sm">
              连接求职者与企业的桥梁，让每个人都能找到理想的工作机会，让每个企业都能找到合适的人才。
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>222385@hebut.edu.hebut.cn</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>400-888-8888</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>天津市北辰区西平道5340号</span>
              </div>
            </div>
          </div>

          {/* Seekers Links */}
          <div>
            <h4 className="font-semibold mb-4">求职者</h4>
            <ul className="space-y-2">
              {footerLinks.seekers.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Companies Links */}
          <div>
            <h4 className="font-semibold mb-4">企业服务</h4>
            <ul className="space-y-2">
              {footerLinks.companies.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h4 className="font-semibold mb-4">关于</h4>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 JobLink. All rights reserved.</p>
          <p>ICP备案号: 京ICP备xxxxxxxx号</p>
        </div>
      </div>
    </footer>
  );
}
