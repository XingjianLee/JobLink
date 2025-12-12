-- =============================================
-- JobLink 在线求职招聘系统 - 数据库架构设计
-- =============================================

-- 1. 用户角色枚举类型
CREATE TYPE public.user_role AS ENUM ('jobseeker', 'company', 'admin');

-- 2. 用户角色表（安全存储角色，防止权限提升攻击）
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'jobseeker',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. 求职者档案表
CREATE TABLE public.jobseeker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    email TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    birth_date DATE,
    location TEXT,
    education_level TEXT,
    work_experience_years INTEGER DEFAULT 0,
    current_status TEXT CHECK (current_status IN ('employed', 'unemployed', 'student', 'freelance')),
    expected_salary_min INTEGER,
    expected_salary_max INTEGER,
    skills TEXT[],
    bio TEXT,
    resume_url TEXT,
    is_public BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.jobseeker_profiles ENABLE ROW LEVEL SECURITY;

-- 4. 企业档案表
CREATE TABLE public.company_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    company_name TEXT NOT NULL,
    logo_url TEXT,
    industry TEXT,
    company_size TEXT CHECK (company_size IN ('1-50', '51-200', '201-500', '501-1000', '1000+')),
    founded_year INTEGER,
    location TEXT,
    address TEXT,
    website TEXT,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    description TEXT,
    license_number TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- 5. 职位表
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    benefits TEXT,
    job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship', 'freelance')),
    experience_required TEXT,
    education_required TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_negotiable BOOLEAN DEFAULT false,
    location TEXT NOT NULL,
    is_remote BOOLEAN DEFAULT false,
    skills_required TEXT[],
    positions_available INTEGER DEFAULT 1,
    application_deadline DATE,
    status TEXT CHECK (status IN ('draft', 'open', 'closed', 'paused')) DEFAULT 'open',
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 6. 简历投递表（求职者 → 企业）
CREATE TABLE public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    jobseeker_id UUID NOT NULL REFERENCES public.jobseeker_profiles(id) ON DELETE CASCADE,
    cover_letter TEXT,
    resume_url TEXT,
    status TEXT CHECK (status IN ('pending', 'viewed', 'shortlisted', 'interview', 'rejected', 'hired')) DEFAULT 'pending',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(job_id, jobseeker_id)
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- 7. 企业招聘邀约表（企业 → 求职者）
CREATE TABLE public.job_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
    jobseeker_id UUID NOT NULL REFERENCES public.jobseeker_profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
    message TEXT,
    status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    responded_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(company_id, jobseeker_id, job_id)
);

ALTER TABLE public.job_invitations ENABLE ROW LEVEL SECURITY;

-- 8. 企业收藏人才表
CREATE TABLE public.talent_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
    jobseeker_id UUID NOT NULL REFERENCES public.jobseeker_profiles(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(company_id, jobseeker_id)
);

ALTER TABLE public.talent_bookmarks ENABLE ROW LEVEL SECURITY;

-- 9. 求职者收藏职位表
CREATE TABLE public.job_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jobseeker_id UUID NOT NULL REFERENCES public.jobseeker_profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(jobseeker_id, job_id)
);

ALTER TABLE public.job_bookmarks ENABLE ROW LEVEL SECURITY;

-- 10. 招聘会表
CREATE TABLE public.job_fairs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    location TEXT NOT NULL,
    address TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    organizer TEXT,
    registration_url TEXT,
    banner_url TEXT,
    status TEXT CHECK (status IN ('upcoming', 'ongoing', 'ended', 'cancelled')) DEFAULT 'upcoming',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.job_fairs ENABLE ROW LEVEL SECURITY;

-- 11. 兼职信息表
CREATE TABLE public.part_time_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    hourly_rate_min INTEGER,
    hourly_rate_max INTEGER,
    location TEXT NOT NULL,
    work_hours TEXT,
    contact_info TEXT,
    status TEXT CHECK (status IN ('open', 'closed')) DEFAULT 'open',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.part_time_jobs ENABLE ROW LEVEL SECURITY;

-- 12. 职场资讯/文章表
CREATE TABLE public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    cover_image_url TEXT,
    category TEXT CHECK (category IN ('career_guide', 'interview_tips', 'industry_news', 'policy', 'other')),
    tags TEXT[],
    author_name TEXT,
    views_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 安全函数定义
-- =============================================

-- 检查用户角色的安全函数
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- 获取用户主要角色
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.user_roles
    WHERE user_id = _user_id
    LIMIT 1
$$;

-- 获取求职者档案ID
CREATE OR REPLACE FUNCTION public.get_jobseeker_profile_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM public.jobseeker_profiles
    WHERE user_id = _user_id
    LIMIT 1
$$;

-- 获取企业档案ID
CREATE OR REPLACE FUNCTION public.get_company_profile_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM public.company_profiles
    WHERE user_id = _user_id
    LIMIT 1
$$;

-- =============================================
-- RLS 策略
-- =============================================

-- user_roles 策略
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- jobseeker_profiles 策略
CREATE POLICY "Jobseekers can manage their own profile"
ON public.jobseeker_profiles FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Public profiles are viewable by authenticated users"
ON public.jobseeker_profiles FOR SELECT
USING (is_public = true AND auth.role() = 'authenticated');

CREATE POLICY "Companies can view public profiles"
ON public.jobseeker_profiles FOR SELECT
USING (is_public = true AND public.has_role(auth.uid(), 'company'));

CREATE POLICY "Admins can manage all jobseeker profiles"
ON public.jobseeker_profiles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- company_profiles 策略
CREATE POLICY "Companies can manage their own profile"
ON public.company_profiles FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Verified companies are publicly viewable"
ON public.company_profiles FOR SELECT
USING (is_verified = true);

CREATE POLICY "Authenticated users can view all companies"
ON public.company_profiles FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage all company profiles"
ON public.company_profiles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- jobs 策略
CREATE POLICY "Open jobs are publicly viewable"
ON public.jobs FOR SELECT
USING (status = 'open');

CREATE POLICY "Companies can manage their own jobs"
ON public.jobs FOR ALL
USING (company_id = public.get_company_profile_id(auth.uid()));

CREATE POLICY "Admins can manage all jobs"
ON public.jobs FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- job_applications 策略
CREATE POLICY "Jobseekers can manage their own applications"
ON public.job_applications FOR ALL
USING (jobseeker_id = public.get_jobseeker_profile_id(auth.uid()));

CREATE POLICY "Companies can view applications for their jobs"
ON public.job_applications FOR SELECT
USING (
    job_id IN (
        SELECT id FROM public.jobs
        WHERE company_id = public.get_company_profile_id(auth.uid())
    )
);

CREATE POLICY "Companies can update application status"
ON public.job_applications FOR UPDATE
USING (
    job_id IN (
        SELECT id FROM public.jobs
        WHERE company_id = public.get_company_profile_id(auth.uid())
    )
);

-- job_invitations 策略
CREATE POLICY "Companies can manage their own invitations"
ON public.job_invitations FOR ALL
USING (company_id = public.get_company_profile_id(auth.uid()));

CREATE POLICY "Jobseekers can view and respond to their invitations"
ON public.job_invitations FOR SELECT
USING (jobseeker_id = public.get_jobseeker_profile_id(auth.uid()));

CREATE POLICY "Jobseekers can update their invitation responses"
ON public.job_invitations FOR UPDATE
USING (jobseeker_id = public.get_jobseeker_profile_id(auth.uid()));

-- talent_bookmarks 策略
CREATE POLICY "Companies can manage their own bookmarks"
ON public.talent_bookmarks FOR ALL
USING (company_id = public.get_company_profile_id(auth.uid()));

-- job_bookmarks 策略
CREATE POLICY "Jobseekers can manage their own bookmarks"
ON public.job_bookmarks FOR ALL
USING (jobseeker_id = public.get_jobseeker_profile_id(auth.uid()));

-- job_fairs 策略
CREATE POLICY "Job fairs are publicly viewable"
ON public.job_fairs FOR SELECT
USING (true);

CREATE POLICY "Admins can manage job fairs"
ON public.job_fairs FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- part_time_jobs 策略
CREATE POLICY "Open part-time jobs are publicly viewable"
ON public.part_time_jobs FOR SELECT
USING (status = 'open');

CREATE POLICY "Companies can manage their own part-time jobs"
ON public.part_time_jobs FOR ALL
USING (company_id = public.get_company_profile_id(auth.uid()));

CREATE POLICY "Admins can manage all part-time jobs"
ON public.part_time_jobs FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- articles 策略
CREATE POLICY "Published articles are publicly viewable"
ON public.articles FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage all articles"
ON public.articles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- 触发器：自动更新 updated_at
-- =============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_jobseeker_profiles_updated_at
    BEFORE UPDATE ON public.jobseeker_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_profiles_updated_at
    BEFORE UPDATE ON public.company_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_fairs_updated_at
    BEFORE UPDATE ON public.job_fairs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_part_time_jobs_updated_at
    BEFORE UPDATE ON public.part_time_jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 索引优化
-- =============================================

CREATE INDEX idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_location ON public.jobs(location);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);

CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_jobseeker_id ON public.job_applications(jobseeker_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);

CREATE INDEX idx_jobseeker_profiles_location ON public.jobseeker_profiles(location);
CREATE INDEX idx_jobseeker_profiles_is_public ON public.jobseeker_profiles(is_public);

CREATE INDEX idx_company_profiles_industry ON public.company_profiles(industry);
CREATE INDEX idx_company_profiles_is_verified ON public.company_profiles(is_verified);

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);