import { useState, useEffect } from "react";
import { JobseekerLayout } from "@/components/layout/JobseekerLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Check,
  X,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Invitation {
  id: string;
  message: string | null;
  status: string | null;
  created_at: string;
  responded_at: string | null;
  company_profiles: {
    company_name: string;
    logo_url: string | null;
  } | null;
  jobs: {
    id: string;
    title: string;
    location: string;
    salary_min: number | null;
    salary_max: number | null;
  } | null;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "待回复", className: "bg-warning/10 text-warning" },
  accepted: { label: "已接受", className: "bg-success/10 text-success" },
  rejected: { label: "已拒绝", className: "bg-muted text-muted-foreground" },
  expired: { label: "已过期", className: "bg-destructive/10 text-destructive" },
};

export default function JobseekerInvitations() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profile } = await supabase
        .from("jobseeker_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!profile) return;

      const { data, error } = await supabase
        .from("job_invitations")
        .select(`
          id,
          message,
          status,
          created_at,
          responded_at,
          company_profiles (
            company_name,
            logo_url
          ),
          jobs (
            id,
            title,
            location,
            salary_min,
            salary_max
          )
        `)
        .eq("jobseeker_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    const { error } = await supabase
      .from("job_invitations")
      .update({ 
        status: "accepted", 
        responded_at: new Date().toISOString() 
      })
      .eq("id", id);

    if (!error) {
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === id
            ? { ...inv, status: "accepted", responded_at: new Date().toISOString() }
            : inv
        )
      );
      toast({
        title: "已接受邀约",
        description: "企业将会收到您的回复，请保持电话畅通",
      });
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from("job_invitations")
      .update({ 
        status: "rejected", 
        responded_at: new Date().toISOString() 
      })
      .eq("id", id);

    if (!error) {
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === id
            ? { ...inv, status: "rejected", responded_at: new Date().toISOString() }
            : inv
        )
      );
      toast({
        title: "已拒绝邀约",
        description: "您可以继续查看其他职位机会",
      });
    }
  };

  const filteredInvitations =
    activeTab === "all"
      ? invitations
      : invitations.filter((inv) => inv.status === activeTab);

  const getCounts = () => {
    const counts: Record<string, number> = { all: invitations.length };
    invitations.forEach((inv) => {
      const status = inv.status || "pending";
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  };

  const counts = getCounts();

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "面议";
    if (min && max) return `${min / 1000}K-${max / 1000}K`;
    if (min) return `${min / 1000}K起`;
    return `${max! / 1000}K`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN");
  };

  if (loading) {
    return (
      <JobseekerLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </JobseekerLayout>
    );
  }

  return (
    <JobseekerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">企业邀约</h1>
          <p className="text-muted-foreground">
            查看并回复企业发来的工作邀请
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending" className="gap-1">
              待回复
              {counts.pending > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-warning/20 text-warning rounded">
                  {counts.pending}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="accepted">已接受</TabsTrigger>
            <TabsTrigger value="rejected">已拒绝</TabsTrigger>
            <TabsTrigger value="all">全部</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Invitations List */}
        {filteredInvitations.length === 0 ? (
          <Card className="p-12 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">暂无邀约</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInvitations.map((invitation) => (
              <Card key={invitation.id} className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Company Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      {invitation.company_profiles?.logo_url ? (
                        <img 
                          src={invitation.company_profiles.logo_url} 
                          alt=""
                          className="w-full h-full rounded-xl object-cover"
                        />
                      ) : (
                        <Building2 className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">
                          {invitation.company_profiles?.company_name || "未知企业"}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${
                            statusConfig[invitation.status || "pending"]?.className || statusConfig.pending.className
                          }`}
                        >
                          {statusConfig[invitation.status || "pending"]?.label || "待回复"}
                        </span>
                      </div>
                      <p className="text-primary font-medium">
                        {invitation.jobs?.title || "未知职位"}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {invitation.jobs?.location || "未知"}
                        </span>
                        <span className="flex items-center gap-1 text-primary font-medium">
                          <DollarSign className="w-4 h-4" />
                          {formatSalary(invitation.jobs?.salary_min || null, invitation.jobs?.salary_max || null)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(invitation.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex-1 lg:border-l lg:border-border lg:pl-6">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">招聘方留言</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {invitation.message || "企业邀请您参加面试"}
                    </p>

                    {/* Actions */}
                    {invitation.status === "pending" && (
                      <div className="flex gap-3 mt-4">
                        <Button onClick={() => handleAccept(invitation.id)}>
                          <Check className="w-4 h-4 mr-2" />
                          接受邀约
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleReject(invitation.id)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          暂不考虑
                        </Button>
                      </div>
                    )}

                    {invitation.status !== "pending" && invitation.responded_at && (
                      <p className="text-sm text-muted-foreground mt-4">
                        回复于 {formatDate(invitation.responded_at)}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </JobseekerLayout>
  );
}
