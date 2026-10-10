ALTER TABLE public.org_members
ADD COLUMN IF NOT EXISTS invite_key varchar(10);

UPDATE public.org_members
SET invite_key = substr(md5(random()::text || clock_timestamp()::text || id::text), 1, 10)
WHERE invite_key IS NULL;

ALTER TABLE public.org_members
ALTER COLUMN invite_key SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS org_members_invite_key_key
ON public.org_members (invite_key);
