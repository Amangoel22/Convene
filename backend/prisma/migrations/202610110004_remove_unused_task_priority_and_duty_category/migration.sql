-- Purpose: removes only the unused task priority and duty category columns.
ALTER TABLE public.duties DROP COLUMN IF EXISTS category;

-- Purpose: removes indexes that referenced the removed fields, if they exist.
DROP INDEX IF EXISTS public.duties_event_id_category_idx;
