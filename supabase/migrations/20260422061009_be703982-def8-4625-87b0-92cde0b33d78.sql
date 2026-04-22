
-- Roles enum and table
create type public.app_role as enum ('teacher', 'student');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users can read own roles"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Teachers can read all roles"
  on public.user_roles for select
  to authenticated
  using (public.has_role(auth.uid(), 'teacher'));

-- Trigger: assign role on signup based on email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email in ('hongjinwoo@simin.hs.kr', 'sitech3@simin.hs.kr') then
    insert into public.user_roles (user_id, role) values (new.id, 'teacher')
    on conflict do nothing;
  else
    insert into public.user_roles (user_id, role) values (new.id, 'student')
    on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Submissions table
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  user_email text not null,
  user_name text,
  part int not null check (part in (1, 2, 3)),
  vocab_answers jsonb not null default '{}'::jsonb,
  grammar_answers jsonb not null default '{}'::jsonb,
  reflection text not null default '',
  inquiry_answer text not null default '',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, part)
);

alter table public.submissions enable row level security;

create policy "Students can view own submissions"
  on public.submissions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Teachers can view all submissions"
  on public.submissions for select
  to authenticated
  using (public.has_role(auth.uid(), 'teacher'));

create policy "Students can insert own submissions"
  on public.submissions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Students can update own submissions"
  on public.submissions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger submissions_updated_at
  before update on public.submissions
  for each row execute function public.touch_updated_at();
