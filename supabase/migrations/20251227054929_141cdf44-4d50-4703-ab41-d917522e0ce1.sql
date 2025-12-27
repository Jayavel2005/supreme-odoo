-- Make request_number have a default value of NULL so the trigger can generate it
ALTER TABLE public.maintenance_requests 
ALTER COLUMN request_number SET DEFAULT NULL;