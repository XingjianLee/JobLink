import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function SeedData() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("seed-test-users", {
        method: "POST",
      });

      if (error) throw error;

      setResult(data);
      toast({
        title: "创建成功",
        description: "测试账户已创建完成",
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "创建失败",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8">
        <div className="mb-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-2">创建测试账户</h1>
        <p className="text-muted-foreground mb-6">
          点击下方按钮创建测试用的求职者和企业账户
        </p>

        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-lg bg-secondary/50">
            <h3 className="font-medium mb-2">求职者账户</h3>
            <p className="text-sm text-muted-foreground">
              邮箱：jobseeker@example.com<br />
              密码：123456
            </p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50">
            <h3 className="font-medium mb-2">企业账户</h3>
            <p className="text-sm text-muted-foreground">
              邮箱：company@example.com<br />
              密码：123456
            </p>
          </div>
        </div>

        <Button onClick={handleSeed} disabled={loading} className="w-full" size="lg">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              创建中...
            </>
          ) : (
            "创建测试账户"
          )}
        </Button>

        {result && (
          <div className="mt-6 p-4 rounded-lg bg-success/10 border border-success/30">
            <div className="flex items-center gap-2 text-success mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">创建完成</span>
            </div>
            <div className="text-sm space-y-1">
              {result.results?.map((r: any, i: number) => (
                <p key={i}>
                  {r.user}: {r.status === "created" ? "已创建" : r.status === "already exists" ? "已存在" : r.status}
                </p>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">错误：{error}</span>
            </div>
          </div>
        )}

        {(result || error) && (
          <div className="mt-6 flex gap-3">
            <Button variant="outline" asChild className="flex-1">
              <Link to="/auth/jobseeker">求职者登录</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link to="/auth/company">企业登录</Link>
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
