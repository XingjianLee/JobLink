## JobLink 数据库设计文档（Supabase）

本项目使用 **Supabase（Postgres）** 作为后端数据库与认证服务，结合 **RLS（行级安全）策略 + 安全函数** 来实现多角色权限控制。  
本设计文档基于 `supabase/migrations/*.sql` 和 `src/integrations/supabase/types.ts`，系统性说明：

- **整体设计目标与思路**
- **枚举 / 公共函数**
- **核心业务实体（表）设计**
- **表之间的关系（ER 关系说明）**
- **权限与安全（RLS、触发器、存储）**

---

## 1. 整体设计思想

### 1.1 业务背景

JobLink 是一个 **在线求职招聘平台**，同时面向：

- **求职者（jobseeker）**：简历、求职档案、职位申请、收藏职位、参加招聘会 / 兼职等。
- **企业（company）**：企业档案、发布职位、管理申请、发出邀约、收藏人才等。
- **管理员（admin）**：平台级内容和数据管理（如文章、招聘会等）。

### 1.2 架构与分层

- **认证用户**：来自 `auth.users`（Supabase 内置）。
- **业务角色与档案**：
  - `user_roles`：用户 → 角色的映射（jobseeker / company / admin）。
  - `jobseeker_profiles`：求职者档案。
  - `company_profiles`：企业档案。
- **招聘主线业务**：
  - `jobs`：职位。
  - `job_applications`：职位申请（简历投递）。
  - `interview_rounds`：面试轮次。
  - `job_invitations`：企业对求职者发出的邀约。
- **收藏与偏好**：
  - `talent_bookmarks`：企业收藏求职者。
  - `job_bookmarks`：求职者收藏职位。
- **内容和活动**：
  - `job_fairs`：招聘会。
  - `part_time_jobs`：兼职信息。
  - `articles`：职场资讯/文章。
- **文件与存储**：
  - `resumes`：简历记录（与存储桶 `resumes` 搭配）。

### 1.3 设计原则

- **强关联**：大量使用 `UUID` 外键与唯一约束来保证数据一致性。
- **前后端强类型**：使用 `supabase gen types` 生成 `Database` 类型，前端通过 `Tables<T>`/`TablesInsert<T>` 保证类型安全。
- **角色驱动权限**：通过 `user_roles` + `has_role`/`get_user_role` 等函数加上 RLS 策略，实现 **按角色和所属资源** 授权。
- **审计字段**：大部分业务表都包含 `created_at` 与 `updated_at`，并通过触发器统一维护 `updated_at`。

---

## 2. 枚举与公共函数

### 2.1 枚举 `user_role`

```sql
CREATE TYPE public.user_role AS ENUM ('jobseeker', 'company', 'admin');
```

- **职责**：作为用户角色的枚举类型，用于：
  - `user_roles.role` 字段。
  - 安全函数 `has_role` / `get_user_role` 的返回或参数类型。
- **设计原因**：使用枚举保证角色值的合法性，并方便在 RLS 策略中进行枚举判断。

### 2.2 用户角色相关安全函数

1. **`has_role(_user_id UUID, _role user_role) RETURNS BOOLEAN`**

   - 作用：判断某用户是否拥有指定角色。
   - 典型用法：在 RLS 策略中，例如：
     - 管理员是否具备 `admin` 角色。
     - 企业权限判断等。

2. **`get_user_role(_user_id UUID) RETURNS user_role`**

   - 作用：获取用户的一个主角色（简单版，取第一条记录）。
   - 用于前端或策略中快速判断用户主身份。

3. **`get_jobseeker_profile_id(_user_id UUID) RETURNS UUID`**

   - 作用：通过 `auth.users.id` 获取对应的 `jobseeker_profiles.id`。
   - 用于 RLS 策略中，把「登录用户」映射到「求职者档案」。

4. **`get_company_profile_id(_user_id UUID) RETURNS UUID`**
   - 作用：通过 `auth.users.id` 获取对应的 `company_profiles.id`。
   - 用途：RLS 中把「登录用户」映射到「企业档案」。

### 2.3 通用更新时间触发器

```sql
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
```

- 应用到多个表（例如 `jobseeker_profiles`、`company_profiles`、`jobs`、`job_applications`、`job_fairs`、`part_time_jobs`、`articles`、`resumes`、`interview_rounds`）。
- **设计思路**：统一维护 `updated_at`，避免应用层忘记更新，提升数据一致性与可维护性。

---

## 3. 核心实体与表设计

本节以「类 / 实体」视角对每张表进行说明，包括字段和角色。

### 3.1 用户与角色

#### 3.1.1 `user_roles` —— 用户角色表

- **定位**：连接 `auth.users` 与系统业务角色的“多对多”桥接表（通常一人一个主角色，但支持多个）。
- **关键字段**：
  - `id UUID PK`
  - `user_id UUID NOT NULL` → `auth.users(id)`
  - `role user_role NOT NULL DEFAULT 'jobseeker'`
  - `created_at TIMESTAMPTZ DEFAULT now()`
  - 唯一约束：`UNIQUE(user_id, role)`
- **关系**：
  - 多个 `user_roles` → 一个 `auth.users`。
- **RLS 策略**（示意）：
  - 用户只能查看自己的角色。
  - Admin 可以查看/管理所有用户的角色。

**设计思路**：

- 不把角色直接写在 `auth.users` 自定义字段中，而是放在独立表中，方便：
  - 多角色扩展。
  - 通过 SQL 和索引做更复杂的统计与查询。

---

### 3.2 档案类：求职者 & 企业

#### 3.2.1 `jobseeker_profiles` —— 求职者档案

- **定位**：求职者的主档案（相当于一个聚合根）。
- **关键字段**：

  - 基础信息：
    - `id UUID PK`
    - `user_id UUID UNIQUE` → `auth.users(id)`
    - `full_name TEXT NOT NULL`
    - `avatar_url TEXT`
    - `phone TEXT`
    - `email TEXT NOT NULL`
  - 个人背景：
    - `gender TEXT CHECK (IN 'male'/'female'/'other')`
    - `birth_date DATE`
    - `location TEXT`
    - `education_level TEXT`
    - `work_experience_years INTEGER`
  - 求职偏好：
    - `current_status TEXT` (`employed/unemployed/student/freelance`)
    - `expected_salary_min/max INTEGER`
    - `skills TEXT[]`
    - `bio TEXT`
    - `resume_url TEXT`（主简历链接，补充用）
  - 状态/审计：
    - `is_public BOOLEAN DEFAULT true`
    - `is_verified BOOLEAN DEFAULT false`
    - `created_at`, `updated_at`

- **关系**：

  - `auth.users (1) —— (1) jobseeker_profiles`
  - 被其他多张表引用：
    - `job_applications.jobseeker_id`
    - `job_invitations.jobseeker_id`
    - `talent_bookmarks.jobseeker_id`
    - `job_bookmarks.jobseeker_id`
    - `resumes.jobseeker_id`

- **RLS 思路**：
  - 求职者可以管理自己的档案。
  - 公共档案（`is_public = true`）在一定范围内可见（企业/认证用户）。
  - Admin 拥有全权限。

**设计思路**：

- 将求职者所有基础信息集中在一张表中，方便查询和组合展示（例如搜索人才、推荐职位）。
- 使用 `skills TEXT[]` 存储标签型技能列表，简化初版实现（后期也可以拆成多对多表）。

#### 3.2.2 `company_profiles` —— 企业档案

- **定位**：企业的主档案信息。
- **关键字段**：

  - 关联：
    - `id UUID PK`
    - `user_id UUID UNIQUE` → `auth.users(id)`
  - 企业信息：
    - `company_name TEXT NOT NULL`
    - `logo_url TEXT`
    - `industry TEXT`
    - `company_size TEXT CHECK (1-50 / 51-200 / 201-500 / 501-1000 / 1000+)`
    - `founded_year INTEGER`
    - `location TEXT`
    - `address TEXT`
    - `website TEXT`
  - 联系方式与资质：
    - `contact_email TEXT NOT NULL`
    - `contact_phone TEXT`
    - `description TEXT`
    - `license_number TEXT`（营业执照等）
    - `is_verified BOOLEAN`
  - 审计：
    - `created_at`, `updated_at`

- **关系**：
  - `auth.users (1) —— (1) company_profiles`
  - 作为外键被引用：
    - `jobs.company_id`
    - `job_invitations.company_id`
    - `talent_bookmarks.company_id`
    - `part_time_jobs.company_id`

**设计思路**：

- 企业档案是企业所有行为的“根”，所有职位、邀约、收藏等都基于此，便于按企业维度进行统计与管理。
- `is_verified` 用于前台展示“已认证企业”标记，与 RLS 策略中“公开可见性”结合。

---

### 3.3 招聘主线：职位、申请与面试

#### 3.3.1 `jobs` —— 职位表

- **定位**：企业发布的正式职位。
- **关键字段**：

  - 基本信息：
    - `id UUID PK`
    - `company_id UUID NOT NULL` → `company_profiles(id)`
    - `title TEXT NOT NULL`
    - `description TEXT NOT NULL`
    - `requirements TEXT`
    - `benefits TEXT`
  - 要求与薪资：
    - `job_type TEXT` (`full-time/part-time/contract/internship/freelance`)
    - `experience_required TEXT`
    - `education_required TEXT`
    - `salary_min/max INTEGER`
    - `salary_negotiable BOOLEAN`
  - 位置与形式：
    - `location TEXT NOT NULL`
    - `is_remote BOOLEAN`
    - `skills_required TEXT[]`
  - 招聘状态：
    - `positions_available INTEGER DEFAULT 1`
    - `application_deadline DATE`
    - `status TEXT` (`draft/open/closed/paused`) 默认 `open`
    - `views_count INTEGER`
  - 时间：
    - `created_at`, `updated_at`

- **关系**：

  - `company_profiles (1) —— (N) jobs`
  - 被以下表引用：
    - `job_applications.job_id`
    - `job_invitations.job_id`
    - `job_bookmarks.job_id`
    - `part_time_jobs` 做为另一条兼职线（职能类似但表结构独立）。

- **RLS 思路**：
  - 所有人可查看 `status = 'open'` 的公开职位。
  - 对于 `company_id = 当前企业` 的职位，企业用户可以管理（增删改）。
  - Admin 拥有全面管理权限。

**设计思路**：

- 单表承载职位的绝大部分信息，满足绝大多数查询场景。
- 使用 `views_count` 做简单的曝光度统计，后期可以拓展为独立的统计/日志系统。

#### 3.3.2 `job_applications` —— 职位申请表

- **定位**：求职者对某个职位的一次申请记录。
- **关键字段**：

  - `id UUID PK`
  - `job_id UUID NOT NULL` → `jobs(id)`（ON DELETE CASCADE）
  - `jobseeker_id UUID NOT NULL` → `jobseeker_profiles(id)`（ON DELETE CASCADE）
  - `cover_letter TEXT`
  - `resume_url TEXT`
  - `status TEXT` (`pending/viewed/shortlisted/interview/rejected/hired`) 默认 `pending`
  - `applied_at`, `updated_at`
  - 唯一约束：`UNIQUE(job_id, jobseeker_id)`（一个职位最多一条申请）

- **关系**：

  - `jobs (1) —— (N) job_applications`
  - `jobseeker_profiles (1) —— (N) job_applications`
  - 被 `interview_rounds.application_id` 外键引用。

- **RLS 思路**：
  - 求职者可以管理自己提交的申请记录。
  - 企业可以查看与自己职位相关的申请，并更新状态。

**设计思路**：

- `status` 流程覆盖常见招聘流程的关键节点，便于企业和求职者双方理解与追踪。
- 后续如需更详细的状态流转历史，可另外设计“申请状态历史表”。

#### 3.3.3 `interview_rounds` —— 面试轮次表

- **定位**：记录每次申请对应的多轮面试信息。
- **关键字段**：

  - `id UUID PK`
  - `application_id UUID NOT NULL` → `job_applications(id)`（ON DELETE CASCADE）
  - `round INTEGER NOT NULL DEFAULT 1`
  - `title TEXT NOT NULL`（如“一面 / HR 面 / 技术面”）
  - `interview_date TIMESTAMPTZ NOT NULL`
  - `interviewer TEXT NOT NULL`
  - `interview_format TEXT NOT NULL DEFAULT 'onsite'`（面试形式：现场/线上等）
  - `score INTEGER`（0–100）
  - `notes TEXT`
  - `status TEXT NOT NULL DEFAULT 'scheduled'`
  - `created_at`, `updated_at`
  - 唯一约束：`UNIQUE(application_id, round)`（对同一个申请，轮次唯一）

- **关系**：

  - `job_applications (1) —— (N) interview_rounds`

- **RLS 思路**：
  - 企业可以管理与自己职位相关的申请对应的所有 `interview_rounds`。
  - 求职者可以查看属于自己申请的 `interview_rounds`。

**设计思路**：

- 将面试记录拆分到独立表，而非字段堆砌在 `job_applications` 上，使得一个申请可以拥有**任意数量的面试轮次**。
- `score` 与 `notes` 为可选字段，方便企业在系统内作简单评价与记录。

---

### 3.4 邀约与收藏

#### 3.4.1 `job_invitations` —— 企业邀约表

- **定位**：企业主动邀请某个求职者来投递/面试的记录。
- **关键字段**：

  - `id UUID PK`
  - `company_id UUID NOT NULL` → `company_profiles(id)`（ON DELETE CASCADE）
  - `jobseeker_id UUID NOT NULL` → `jobseeker_profiles(id)`（ON DELETE CASCADE）
  - `job_id UUID NULL` → `jobs(id)`（ON DELETE SET NULL，可为通用邀约）
  - `message TEXT`
  - `status TEXT DEFAULT 'pending'`（`pending/accepted/rejected/expired`）
  - `created_at TIMESTAMPTZ DEFAULT now()`
  - `responded_at TIMESTAMPTZ`
  - 唯一约束：`UNIQUE(company_id, jobseeker_id, job_id)`

- **关系**：
  - `company_profiles (1) —— (N) job_invitations`
  - `jobseeker_profiles (1) —— (N) job_invitations`
  - `jobs (1) —— (N) job_invitations`

**设计思路**：

- 支持“企业对求职者的主动出击”，可以是针对某个职位的定向邀约，也可以是更泛的邀约（`job_id` 为空）。
- 唯一约束防止同一职位对同一求职者产生重复邀约垃圾。

#### 3.4.2 `talent_bookmarks` —— 企业收藏人才表

- **定位**：企业收藏求职者档案的记录。
- **关键字段**：

  - `id UUID PK`
  - `company_id UUID NOT NULL` → `company_profiles(id)`
  - `jobseeker_id UUID NOT NULL` → `jobseeker_profiles(id)`
  - `notes TEXT`
  - `created_at TIMESTAMPTZ DEFAULT now()`
  - 唯一约束：`UNIQUE(company_id, jobseeker_id)`

- **关系**：
  - `company_profiles (1) —— (N) talent_bookmarks`
  - `jobseeker_profiles (1) —— (N) talent_bookmarks`

**设计思路**：

- 结构类似典型“收藏/关注”关系表，方便企业维护人才池，并可在 UI 中展示标记和备注。

#### 3.4.3 `job_bookmarks` —— 求职者收藏职位表

- **定位**：求职者收藏职位的记录。
- **关键字段**：

  - `id UUID PK`
  - `jobseeker_id UUID NOT NULL` → `jobseeker_profiles(id)`
  - `job_id UUID NOT NULL` → `jobs(id)`
  - `created_at TIMESTAMPTZ DEFAULT now()`
  - 唯一约束：`UNIQUE(jobseeker_id, job_id)`

- **关系**：
  - `jobseeker_profiles (1) —— (N) job_bookmarks`
  - `jobs (1) —— (N) job_bookmarks`

**设计思路**：

- 典型“用户收藏内容”场景的关系表，实现职位的收藏 / 取消收藏功能。

---

### 3.5 活动与内容

#### 3.5.1 `job_fairs` —— 招聘会表

- **定位**：线下或线上招聘会活动。
- **关键字段**：
  - `id UUID PK`
  - `title TEXT NOT NULL`
  - `description TEXT`
  - `location TEXT NOT NULL`
  - `address TEXT`
  - `start_time TIMESTAMPTZ NOT NULL`
  - `end_time TIMESTAMPTZ NOT NULL`
  - `organizer TEXT`
  - `registration_url TEXT`
  - `banner_url TEXT`
  - `status TEXT DEFAULT 'upcoming'`（`upcoming/ongoing/ended/cancelled`）
  - `created_by UUID` → `auth.users(id)`
  - `created_at`, `updated_at`

**设计思路**：

- 面向前台展示和后台管理的活动实体，可扩展为和 `company_profiles` 的多对多关联（哪些公司参加了该招聘会）等。

#### 3.5.2 `part_time_jobs` —— 兼职信息表

- **定位**：兼职/灵活用工岗位。
- **关键字段**：
  - `id UUID PK`
  - `company_id UUID NULL` → `company_profiles(id)`（ON DELETE SET NULL）
  - `title TEXT NOT NULL`
  - `description TEXT NOT NULL`
  - `requirements TEXT`
  - `hourly_rate_min/max INTEGER`
  - `location TEXT NOT NULL`
  - `work_hours TEXT`
  - `contact_info TEXT`
  - `status TEXT DEFAULT 'open'`（`open/closed`）
  - `created_by UUID` → `auth.users(id)`
  - `created_at`, `updated_at`

**设计思路**：

- 兼职和正式职位结构有一定重叠，但业务语义略不同，所以使用单独表，保证字段意义清晰。

#### 3.5.3 `articles` —— 职场资讯 / 文章表

- **定位**：平台对外的内容系统，如职业指南、面试技巧、行业新闻等。
- **关键字段**：
  - `id UUID PK`
  - `title TEXT NOT NULL`
  - `content TEXT NOT NULL`
  - `summary TEXT`
  - `cover_image_url TEXT`
  - `category TEXT`（`career_guide/interview_tips/industry_news/policy/other`）
  - `tags TEXT[]`
  - `author_name TEXT`
  - `views_count INTEGER DEFAULT 0`
  - `is_published BOOLEAN DEFAULT false`
  - `published_at TIMESTAMPTZ`
  - `created_by UUID` → `auth.users(id)`
  - `created_at`, `updated_at`

**设计思路**：

- 典型 CMS 型结构，配合 RLS：只公开 `is_published = true` 的文章。

---

### 3.6 简历与存储

#### 3.6.1 `resumes` —— 简历文件记录表

- **定位**：管理求职者上传的多个简历文件记录。
- **关键字段**：

  - `id UUID PK`
  - `jobseeker_id UUID NOT NULL` → `jobseeker_profiles(id)`（ON DELETE CASCADE）
  - `name TEXT NOT NULL`（文件名或简历别名）
  - `file_url TEXT NOT NULL`
  - `file_size INTEGER`
  - `is_default BOOLEAN NOT NULL DEFAULT false`
  - `created_at`, `updated_at`

- **关系**：
  - 一个 `jobseeker_profiles` 可以有多条 `resumes`（多个版本）。
  - 与 `storage.objects` 中 `bucket_id = 'resumes'` 的对象路径对应。

**设计思路**：

- 通过单独表记录简历元数据，配合存储策略控制实际文件访问。
- `is_default` 用于 UI 中标记当前默认使用的简历。

#### 3.6.2 存储桶与存储 RLS（简要）

- 创建桶：

```sql
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('resumes', 'resumes', false, 10485760);
```

- 存储策略要点：
  - 求职者只能上传/查看/删除自己目录下的简历文件（通过 `storage.foldername(name)[1] = auth.uid()` 约束）。
  - 企业在满足条件时可以查看应聘者的简历文件（结合 `job_applications`、`jobs`、`jobseeker_profiles` 进行权限判断）。

**设计思路**：

- 逻辑上将简历文件与数据库中的 `resumes` 表分离，但通过相同的用户 ID 路径策略和外键保证一致性与安全性。

---

## 4. 表之间的关系（ER 概览）

下面用文字描述主要的 ER 关系结构（省略部分细节）：

- **用户与角色**：

  - `auth.users (1) —— (N) user_roles`
  - `auth.users (1) —— (1) jobseeker_profiles`
  - `auth.users (1) —— (1) company_profiles`
  - `auth.users (1) —— (N) job_fairs.created_by / part_time_jobs.created_by / articles.created_by`

- **档案与业务主线**：

  - `company_profiles (1) —— (N) jobs`
  - `jobseeker_profiles (1) —— (N) job_applications`
  - `job_applications (1) —— (N) interview_rounds`

- **邀约与收藏**：

  - `company_profiles (1) —— (N) job_invitations`
  - `jobseeker_profiles (1) —— (N) job_invitations`
  - `company_profiles (1) —— (N) talent_bookmarks`
  - `jobseeker_profiles (1) —— (N) talent_bookmarks`
  - `jobseeker_profiles (1) —— (N) job_bookmarks`
  - `jobs (1) —— (N) job_bookmarks`

- **兼职与招聘会**：

  - `company_profiles (1) —— (N) part_time_jobs`（可空）
  - `auth.users (1) —— (N) job_fairs`（创建者）

- **简历与存储**：
  - `jobseeker_profiles (1) —— (N) resumes`
  - `resumes` 与 `storage.objects` 通过路径约定和用户 ID 建立逻辑关联。

---

## 5. 安全与索引设计（简要）

### 5.1 RLS（Row Level Security）

绝大多数业务表均启用了 RLS，并围绕如下原则设计策略：

- **最小权限原则**：默认仅资源所有者可读写其资源（如求职者/企业自身数据）。
- **角色增强**：通过 `has_role` 与 `get_user_role` 扩展管理员能力。
- **公开资源**：
  - `jobs` 中 `status = 'open'` 的职位可公开查看。
  - `job_fairs` 默认可公开查看。
  - `articles` 中 `is_published = true` 的文章可公开查看。

### 5.2 索引

为提升查询速度，在高频字段上建立了索引，例如：

- `jobs`：
  - `idx_jobs_company_id (company_id)`
  - `idx_jobs_status (status)`
  - `idx_jobs_location (location)`
  - `idx_jobs_created_at (created_at DESC)`
- `job_applications`：
  - 按 `job_id`、`jobseeker_id`、`status` 建立索引。
- `jobseeker_profiles`：
  - 按 `location`、`is_public` 建立索引，优化人才搜索。
- `company_profiles`：
  - 按 `industry`、`is_verified` 建立索引。
- `user_roles`：
  - 按 `user_id`、`role` 建立索引，提升权限判断性能。

---

## 6. 总结与后续扩展方向

- 当前数据库结构已经覆盖：
  - **求职者**：档案、简历、多版本简历、职位申请、面试轮次、职位收藏。
  - **企业**：档案、职位、邀约、人才收藏、兼职岗位。
  - **平台**：招聘会、文章内容系统。
  - **安全**：角色枚举、角色表、RLS 策略、统一 `updated_at` 触发器、简历存储桶权限。
- 前后端通过 `src/integrations/supabase/types.ts` 共用 `Database` 类型，保证前端查询和插入更新的类型安全。

后续可以考虑的扩展：

- 独立的 **消息/通知系统表**（例如站内信、系统通知）。
- 更细粒度的 **申请状态历史表** 或 **日志表**，记录每次状态变更。
- 更规范的 **技能与标签** 多对多表，而非简单的 `TEXT[]`。
- **多组织 / 多品牌** 支持，扩展 `company_profiles` 的层级结构。
