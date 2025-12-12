import { useState, useEffect } from "react";
import { CompanyLayout } from "@/components/layout/CompanyLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Globe, MapPin, Users, Calendar, Mail, Phone, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CompanyProfile {
  id: string;
  company_name: string;
  description: string | null;
  industry: string | null;
  company_size: string | null;
  founded_year: number | null;
  location: string | null;
  address: string | null;
  website: string | null;
  contact_email: string;
  contact_phone: string | null;
  logo_url: string | null;
  license_number: string | null;
  is_verified: boolean;
}

const industries = [
  "互联网/IT",
  "金融/银行",
  "教育/培训",
  "医疗/健康",
  "制造业",
  "房地产",
  "零售/电商",
  "物流/运输",
  "餐饮/酒店",
  "文化/传媒",
  "其他",
];

const companySizes = [
  "1-50人",
  "51-100人",
  "101-500人",
  "501-1000人",
  "1000人以上",
];

export default function CompanyProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from("company_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    const { error } = await supabase
      .from("company_profiles")
      .update({
        company_name: profile.company_name,
        description: profile.description,
        industry: profile.industry,
        company_size: profile.company_size,
        founded_year: profile.founded_year,
        location: profile.location,
        address: profile.address,
        website: profile.website,
        contact_email: profile.contact_email,
        contact_phone: profile.contact_phone,
        license_number: profile.license_number,
      })
      .eq("id", profile.id);

    if (error) {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "保存成功",
        description: "企业信息已更新",
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <CompanyLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </CompanyLayout>
    );
  }

  if (!profile) {
    return (
      <CompanyLayout>
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">未找到企业信息</p>
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">企业信息</h1>
            <p className="text-muted-foreground">管理您的企业基本信息</p>
          </div>
          {profile.is_verified && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">已认证</span>
            </div>
          )}
        </div>

        {/* Company Logo */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">企业Logo</h3>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-xl bg-secondary flex items-center justify-center">
              {profile.logo_url ? (
                <img
                  src={profile.logo_url}
                  alt={profile.company_name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <Building2 className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div>
              <Button variant="outline" size="sm">
                上传Logo
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                建议尺寸：200x200像素，支持 JPG、PNG 格式
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Info */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">基本信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="company_name">
                企业名称 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company_name"
                value={profile.company_name}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">所属行业</Label>
              <Select
                value={profile.industry || ""}
                onValueChange={(value) => setProfile({ ...profile, industry: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择行业" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_size">企业规模</Label>
              <Select
                value={profile.company_size || ""}
                onValueChange={(value) => setProfile({ ...profile, company_size: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择规模" />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="founded_year">成立年份</Label>
              <Input
                id="founded_year"
                type="number"
                value={profile.founded_year || ""}
                onChange={(e) => setProfile({ ...profile, founded_year: parseInt(e.target.value) || null })}
                placeholder="例如：2010"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">企业介绍</Label>
              <Textarea
                id="description"
                value={profile.description || ""}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                placeholder="请输入企业介绍..."
                rows={4}
              />
            </div>
          </div>
        </Card>

        {/* Contact Info */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">联系方式</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contact_email">
                联系邮箱 <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="contact_email"
                  type="email"
                  className="pl-10"
                  value={profile.contact_email}
                  onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">联系电话</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="contact_phone"
                  className="pl-10"
                  value={profile.contact_phone || ""}
                  onChange={(e) => setProfile({ ...profile, contact_phone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">企业网站</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="website"
                  className="pl-10"
                  value={profile.website || ""}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  placeholder="https://"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="license_number">营业执照号</Label>
              <Input
                id="license_number"
                value={profile.license_number || ""}
                onChange={(e) => setProfile({ ...profile, license_number: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Address */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">地址信息</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="location">所在城市</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="location"
                  className="pl-10"
                  value={profile.location || ""}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="例如：北京"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">详细地址</Label>
              <Input
                id="address"
                value={profile.address || ""}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="请输入详细地址"
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            保存修改
          </Button>
        </div>
      </div>
    </CompanyLayout>
  );
}
