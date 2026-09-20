INSERT INTO public.user_roles (user_id, role)
VALUES ('70e515e5-d3b0-4e46-b239-7ddea8ca24be', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;