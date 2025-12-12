import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Video, FileText, MapPin, Clock, ChevronRight, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface UpcomingEvent {
  id: string;
  type: "interview" | "written_test";
  title: string;
  company: string;
  jobTitle: string;
  date: string;
  time: string;
  location: string;
  isOnline: boolean;
  interviewFormat: string;
}

const eventTypeConfig: Record<string, { icon: typeof Calendar; label: string; className: string }> = {
  interview: {
    icon: Video,
    label: "面试",
    className: "bg-primary/10 text-primary border-primary/30"
  },
  written_test: {
    icon: FileText,
    label: "笔试",
    className: "bg-accent/10 text-accent border-accent/30"
  }
};

const formatLabels: Record<string, { icon: typeof Video; label: string }> = {
  onsite: { icon: MapPin, label: "现场面试" },
  video: { icon: Video, label: "视频面试" },
  phone: { icon: Phone, label: "电话面试" },
  online_test: { icon: FileText, label: "在线笔试" }
};

export function UpcomingEventsTimeline() {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 获取 jobseeker profile id
      const { data: profile } = await supabase
        .from("jobseeker_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) return;

      // 获取即将到来的面试/笔试（状态为 scheduled，日期 >= 今天）
      const today = new Date().toISOString();
      
      const { data: interviews, error } = await supabase
        .from("interview_rounds")
        .select(`
          id,
          title,
          interview_date,
          interview_format,
          interviewer,
          status,
          application_id
        `)
        .eq("status", "scheduled")
        .gte("interview_date", today)
        .order("interview_date", { ascending: true })
        .limit(5);

      if (error) throw error;

      if (!interviews || interviews.length === 0) {
        setEvents([]);
        return;
      }

      // 获取关联的申请信息
      const applicationIds = interviews.map(i => i.application_id);
      const { data: applications } = await supabase
        .from("job_applications")
        .select(`
          id,
          job_id
        `)
        .in("id", applicationIds)
        .eq("jobseeker_id", profile.id);

      if (!applications) {
        setEvents([]);
        return;
      }

      // 获取关联的职位和公司信息
      const jobIds = applications.map(a => a.job_id);
      const { data: jobs } = await supabase
        .from("jobs")
        .select(`
          id,
          title,
          company_id
        `)
        .in("id", jobIds);

      if (!jobs) {
        setEvents([]);
        return;
      }

      // 获取公司信息
      const companyIds = jobs.map(j => j.company_id);
      const { data: companies } = await supabase
        .from("company_profiles")
        .select("id, company_name")
        .in("id", companyIds);

      // 组装数据
      const eventsData: UpcomingEvent[] = interviews
        .map(interview => {
          const application = applications.find(a => a.id === interview.application_id);
          if (!application) return null;
          
          const job = jobs.find(j => j.id === application.job_id);
          if (!job) return null;
          
          const company = companies?.find(c => c.id === job.company_id);
          
          const interviewDate = new Date(interview.interview_date);
          const isOnline = ["video", "phone", "online_test"].includes(interview.interview_format);
          const type = interview.interview_format === "online_test" ? "written_test" : "interview";
          
          const formatInfo = formatLabels[interview.interview_format] || formatLabels.onsite;
          
          return {
            id: interview.id,
            type,
            title: interview.title,
            company: company?.company_name || "未知公司",
            jobTitle: job.title,
            date: interviewDate.toLocaleDateString("zh-CN"),
            time: interviewDate.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
            location: formatInfo.label,
            isOnline,
            interviewFormat: interview.interview_format
          };
        })
        .filter((e): e is UpcomingEvent => e !== null);

      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">即将到来</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">加载中...</div>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">即将到来</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">暂无即将到来的面试或笔试</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">即将到来</h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
            {events.length}
          </span>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/jobseeker/applications">
            查看全部
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-border" />

        <div className="space-y-4">
          {events.map((event) => {
            const config = eventTypeConfig[event.type];
            const Icon = config.icon;
            const formatInfo = formatLabels[event.interviewFormat] || formatLabels.onsite;
            const FormatIcon = formatInfo.icon;
            
            return (
              <div key={event.id} className="relative flex gap-4 group">
                {/* Timeline dot */}
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${config.className}`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Event content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${config.className}`}>
                          {config.label}
                        </span>
                        <span className="text-sm font-medium">{event.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.company} · {event.jobTitle}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {event.date} {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <FormatIcon className="w-3 h-3" />
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
