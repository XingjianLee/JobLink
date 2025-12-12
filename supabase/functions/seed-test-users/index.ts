import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// This function is meant for initial seed data - no auth required

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const results: any[] = [];

    // Create Jobseeker account
    const { data: jobseekerAuth, error: jobseekerAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: "jobseeker@example.com",
      password: "123456",
      email_confirm: true,
      user_metadata: {
        full_name: "测试求职者",
        user_type: "jobseeker",
      },
    });

    if (jobseekerAuthError) {
      if (jobseekerAuthError.message.includes("already been registered")) {
        results.push({ user: "jobseeker@example.com", status: "already exists" });
      } else {
        throw jobseekerAuthError;
      }
    } else if (jobseekerAuth.user) {
      // Create user role
      await supabaseAdmin.from("user_roles").upsert({
        user_id: jobseekerAuth.user.id,
        role: "jobseeker",
      }, { onConflict: "user_id,role" });

      // Create jobseeker profile
      await supabaseAdmin.from("jobseeker_profiles").upsert({
        user_id: jobseekerAuth.user.id,
        full_name: "测试求职者",
        email: "jobseeker@example.com",
        phone: "13800138000",
        gender: "male",
        location: "北京",
        education_level: "本科",
        work_experience_years: 3,
        current_status: "employed",
        expected_salary_min: 20000,
        expected_salary_max: 35000,
        skills: ["React", "TypeScript", "Node.js", "Python"],
        bio: "3年前端开发经验，熟悉React生态，有大型项目实战经验。",
        is_public: true,
      }, { onConflict: "user_id" });

      results.push({ user: "jobseeker@example.com", status: "created", id: jobseekerAuth.user.id });
    }

    // Create Company account
    const { data: companyAuth, error: companyAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: "company@example.com",
      password: "123456",
      email_confirm: true,
      user_metadata: {
        full_name: "测试企业",
        user_type: "company",
      },
    });

    if (companyAuthError) {
      if (companyAuthError.message.includes("already been registered")) {
        results.push({ user: "company@example.com", status: "already exists" });
      } else {
        throw companyAuthError;
      }
    } else if (companyAuth.user) {
      // Create user role
      await supabaseAdmin.from("user_roles").upsert({
        user_id: companyAuth.user.id,
        role: "company",
      }, { onConflict: "user_id,role" });

      // Create company profile
      const { data: companyProfile } = await supabaseAdmin.from("company_profiles").upsert({
        user_id: companyAuth.user.id,
        company_name: "测试科技有限公司",
        contact_email: "company@example.com",
        contact_phone: "010-88888888",
        industry: "互联网/科技",
        company_size: "51-200",
        founded_year: 2018,
        location: "北京",
        address: "北京市朝阳区科技园区",
        website: "https://example.com",
        description: "我们是一家专注于创新技术的科技公司，致力于用科技改变生活。团队氛围活跃，福利优厚。",
        is_verified: true,
      }, { onConflict: "user_id" }).select().single();

      // Create some sample jobs for the company
      if (companyProfile) {
        await supabaseAdmin.from("jobs").upsert([
          {
            company_id: companyProfile.id,
            title: "高级前端工程师",
            description: "负责公司核心产品的前端开发，包括PC端和移动端应用。参与技术方案设计，推动团队技术提升。",
            requirements: "1. 3年以上前端开发经验\n2. 精通React/Vue等主流框架\n3. 有大型项目经验优先",
            benefits: "五险一金、带薪年假、弹性工作、免费三餐、健身房",
            job_type: "full-time",
            experience_required: "3-5年",
            education_required: "本科",
            salary_min: 25000,
            salary_max: 40000,
            location: "北京",
            skills_required: ["React", "TypeScript", "Webpack", "Node.js"],
            positions_available: 2,
            status: "open",
          },
          {
            company_id: companyProfile.id,
            title: "产品经理",
            description: "负责公司核心产品的规划与设计，协调各部门资源推进产品迭代。",
            requirements: "1. 2年以上B端产品经验\n2. 有良好的数据分析能力\n3. 优秀的沟通协调能力",
            benefits: "五险一金、带薪年假、年度旅游、期权激励",
            job_type: "full-time",
            experience_required: "2-3年",
            education_required: "本科",
            salary_min: 20000,
            salary_max: 35000,
            location: "北京",
            skills_required: ["产品规划", "数据分析", "用户研究", "Axure"],
            positions_available: 1,
            status: "open",
          },
          {
            company_id: companyProfile.id,
            title: "后端开发工程师",
            description: "负责服务端架构设计与开发，保障系统高可用与高性能。",
            requirements: "1. 3年以上Java/Go开发经验\n2. 熟悉分布式系统设计\n3. 有微服务架构经验",
            benefits: "五险一金、带薪年假、技术培训、股票期权",
            job_type: "full-time",
            experience_required: "3-5年",
            education_required: "本科",
            salary_min: 28000,
            salary_max: 45000,
            location: "北京",
            skills_required: ["Java", "Spring Boot", "MySQL", "Redis", "Kubernetes"],
            positions_available: 3,
            status: "open",
          },
        ], { onConflict: "id" });
      }

      results.push({ user: "company@example.com", status: "created", id: companyAuth.user.id });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "测试账户创建完成",
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
