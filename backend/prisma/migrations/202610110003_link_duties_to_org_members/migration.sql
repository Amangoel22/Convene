-- Allows duties to remain assigned to pending organization members until registration.
ALTER TABLE public.duty_assignments
  ADD COLUMN IF NOT EXISTS org_member_id uuid;

ALTER TABLE public.duty_assignments
  ALTER COLUMN user_id DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'duty_assignments_org_member_id_fkey'
  ) THEN
    ALTER TABLE public.duty_assignments
      ADD CONSTRAINT duty_assignments_org_member_id_fkey
      FOREIGN KEY (org_member_id) REFERENCES public.org_members(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS duty_assignments_event_org_member_idx
  ON public.duty_assignments(event_id, org_member_id);

CREATE UNIQUE INDEX IF NOT EXISTS duty_assignments_duty_org_member_key
  ON public.duty_assignments(duty_id, org_member_id);
