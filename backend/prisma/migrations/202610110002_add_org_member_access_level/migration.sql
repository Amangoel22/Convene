-- Adds organizer/member access control without removing existing records.
ALTER TABLE public.org_members
ADD COLUMN IF NOT EXISTS access_level varchar(20) NOT NULL DEFAULT 'member';

UPDATE public.org_members AS member
SET access_level = access.access_level::text
FROM public.org_access AS access
WHERE access.event_id = member.event_id
  AND access.user_id = member.user_id
  AND member.user_id IS NOT NULL;

INSERT INTO public.org_access (id, event_id, user_id, access_level, created_at)
SELECT gen_random_uuid(), membership.event_id, membership.user_id, 'lead', now()
FROM public.event_memberships AS membership
WHERE membership.role = 'organizer'
  AND NOT EXISTS (
    SELECT 1
    FROM public.org_access AS access
    WHERE access.event_id = membership.event_id
      AND access.user_id = membership.user_id
  );
