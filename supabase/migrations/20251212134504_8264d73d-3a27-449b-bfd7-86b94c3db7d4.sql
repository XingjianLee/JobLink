-- Create interview_rounds table to store interview data
CREATE TABLE public.interview_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.job_applications(id) ON DELETE CASCADE,
  round INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  interview_date TIMESTAMP WITH TIME ZONE NOT NULL,
  interviewer TEXT NOT NULL,
  interview_format TEXT NOT NULL DEFAULT 'onsite',
  score INTEGER CHECK (score >= 0 AND score <= 100),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(application_id, round)
);

-- Enable RLS
ALTER TABLE public.interview_rounds ENABLE ROW LEVEL SECURITY;

-- Companies can manage interview rounds for their job applications
CREATE POLICY "Companies can manage interview rounds for their applications"
ON public.interview_rounds
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM job_applications ja
    JOIN jobs j ON ja.job_id = j.id
    WHERE ja.id = interview_rounds.application_id
    AND j.company_id = get_company_profile_id(auth.uid())
  )
);

-- Jobseekers can view their own interview rounds
CREATE POLICY "Jobseekers can view their interview rounds"
ON public.interview_rounds
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM job_applications ja
    WHERE ja.id = interview_rounds.application_id
    AND ja.jobseeker_id = get_jobseeker_profile_id(auth.uid())
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_interview_rounds_updated_at
BEFORE UPDATE ON public.interview_rounds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster queries
CREATE INDEX idx_interview_rounds_application_id ON public.interview_rounds(application_id);
CREATE INDEX idx_interview_rounds_status ON public.interview_rounds(status);