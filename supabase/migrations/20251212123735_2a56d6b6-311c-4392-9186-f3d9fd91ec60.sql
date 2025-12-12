-- Create resumes table
CREATE TABLE public.resumes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  jobseeker_id UUID NOT NULL REFERENCES public.jobseeker_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Jobseekers can manage their own resumes"
ON public.resumes
FOR ALL
USING (jobseeker_id = get_jobseeker_profile_id(auth.uid()));

CREATE POLICY "Companies can view resumes of applicants"
ON public.resumes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM job_applications ja
    JOIN jobs j ON ja.job_id = j.id
    WHERE ja.jobseeker_id = resumes.jobseeker_id
    AND j.company_id = get_company_profile_id(auth.uid())
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_resumes_updated_at
BEFORE UPDATE ON public.resumes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('resumes', 'resumes', false, 10485760);

-- Storage policies
CREATE POLICY "Jobseekers can upload their own resumes"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Jobseekers can view their own resumes"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Jobseekers can delete their own resumes"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'resumes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Companies can view applicant resumes"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'resumes'
  AND EXISTS (
    SELECT 1 FROM job_applications ja
    JOIN jobs j ON ja.job_id = j.id
    JOIN jobseeker_profiles jp ON ja.jobseeker_id = jp.id
    WHERE jp.user_id::text = (storage.foldername(name))[1]
    AND j.company_id = get_company_profile_id(auth.uid())
  )
);