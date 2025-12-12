import { useState, useEffect } from "react";
import { CompanyLayout } from "@/components/layout/CompanyLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Send,
  Users,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Invitation {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  responded_at: string | null;
  jobTitle: string;
  talent: {
    id: string;
    full_name: string;
    email: string;
  };
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  pending: { label: "待回复", variant: "outline", icon: Clock },
  accepted: { label: "已接受", variant: "default", icon: CheckCircle2 },
  rejected: { label: "已拒绝", variant: "destructive", icon: XCircle },
};

export default function CompanyInvitations() {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invitationToDelete, setInvitationToDelete] = useState<Invitation | null>(null);

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  useEffect(() => {
    if (companyId) {
      fetchInvitations();
    }
  }, [companyId]);

  const fetchCompanyProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      
      if (data) {
        setCompanyId(data.id);
      }
    }
  };

  const fetchInvitations = async () => {
    if (!companyId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("job_invitations")
      .select(`
        id,
        status,
        message,
        created_at,
        responded_at,
        jobs (
          title
        ),
        jobseeker_profiles (
          id,
          full_name,
          email
        )
      `)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "加载失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setInvitations(
        data?.map((inv: any) => ({
          id: inv.id,
          status: inv.status,
          message: inv.message,
          created_at: inv.created_at,
          responded_at: inv.responded_at,
          jobTitle: inv.jobs?.title || "未关联职位",
          talent: inv.jobseeker_profiles,
        })) || []
      );
    }
    setLoading(false);
  };

  const confirmDelete = (invitation: Invitation) => {
    setInvitationToDelete(invitation);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!invitationToDelete) return;

    const { error } = await supabase
      .from("job_invitations")
      .delete()
      .eq("id", invitationToDelete.id);

    if (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "邀请已删除" });
      fetchInvitations();
    }
    setDeleteDialogOpen(false);
    setInvitationToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredInvitations = invitations.filter((inv) => {
    if (activeTab === "all") return true;
    return inv.status === activeTab;
  });

  const statusCounts = {
    all: invitations.length,
    pending: invitations.filter((i) => i.status === "pending").length,
    accepted: invitations.filter((i) => i.status === "accepted").length,
    rejected: invitations.filter((i) => i.status === "rejected").length,
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

  return (
    <CompanyLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">发送的邀请</h1>
          <p className="text-muted-foreground">查看和管理您发送的招聘邀请</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold">{statusCounts.all}</p>
            <p className="text-sm text-muted-foreground">全部邀请</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
            <p className="text-sm text-muted-foreground">待回复</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{statusCounts.accepted}</p>
            <p className="text-sm text-muted-foreground">已接受</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">{statusCounts.rejected}</p>
            <p className="text-sm text-muted-foreground">已拒绝</p>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="pending">待回复</TabsTrigger>
            <TabsTrigger value="accepted">已接受</TabsTrigger>
            <TabsTrigger value="rejected">已拒绝</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredInvitations.length === 0 ? (
              <Card className="p-12 text-center">
                <Send className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">暂无邀请</h3>
                <p className="text-muted-foreground">
                  {activeTab === "all"
                    ? "您还没有发送任何邀请"
                    : "没有符合条件的邀请"}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredInvitations.map((invitation) => {
                  const status = statusConfig[invitation.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  return (
                    <Card key={invitation.id} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Users className="w-6 h-6 text-primary" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold">{invitation.talent.full_name}</h3>
                            <Badge variant={status.variant} className="gap-1">
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Briefcase className="w-4 h-4" />
                            <span>邀请职位: {invitation.jobTitle}</span>
                          </div>
                          {invitation.message && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              留言: {invitation.message}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground text-right">
                            <p>发送于 {formatDate(invitation.created_at)}</p>
                            {invitation.responded_at && (
                              <p>回复于 {formatDate(invitation.responded_at)}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => confirmDelete(invitation)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除向 "{invitationToDelete?.talent.full_name}" 发送的邀请吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CompanyLayout>
  );
}
