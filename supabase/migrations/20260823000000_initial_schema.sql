-- ATZ Digital Academy LMS — Schema Migration
-- Run this on a fresh Supabase project via SQL Editor or Supabase CLI

-- Enable UUID extension (usually already enabled on Supabase)
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase Auth users)
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('admin', 'student')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================
-- COURSES
-- ============================================
create table courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  brand_theme text default 'atz-navy-gold',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table courses enable row level security;

-- ============================================
-- MODULES
-- ============================================
create table modules (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  order_index integer not null default 0,
  live_session_url text,
  recording_url text,
  release_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table modules enable row level security;

create index idx_modules_course_id on modules(course_id);
create index idx_modules_order_index on modules(course_id, order_index);

-- ============================================
-- MATERIALS
-- ============================================
create table materials (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  file_url text not null,
  file_type text not null default 'other' check (file_type in ('pdf', 'pptx', 'docx', 'other')),
  created_at timestamptz not null default now()
);

alter table materials enable row level security;

create index idx_materials_module_id on materials(module_id);

-- ============================================
-- QUIZZES
-- ============================================
create table quizzes (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid not null references modules(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

alter table quizzes enable row level security;

create unique index idx_quizzes_module_id on quizzes(module_id);

-- ============================================
-- QUIZ QUESTIONS
-- ============================================
create table quiz_questions (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  prompt text not null,
  options jsonb not null,
  correct_option_index integer not null,
  created_at timestamptz not null default now()
);

alter table quiz_questions enable row level security;

create index idx_quiz_questions_quiz_id on quiz_questions(quiz_id);

-- ============================================
-- ENROLLMENTS
-- ============================================
create table enrollments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  status text not null default 'active' check (status in ('active', 'completed')),
  unique(user_id, course_id)
);

alter table enrollments enable row level security;

create index idx_enrollments_user_id on enrollments(user_id);
create index idx_enrollments_course_id on enrollments(course_id);

-- ============================================
-- QUIZ ATTEMPTS
-- ============================================
create table quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  quiz_id uuid not null references quizzes(id) on delete cascade,
  score numeric(5,2) not null,
  completed_at timestamptz not null default now()
);

alter table quiz_attempts enable row level security;

create index idx_quiz_attempts_user_id on quiz_attempts(user_id);
create index idx_quiz_attempts_quiz_id on quiz_attempts(quiz_id);

-- ============================================
-- PROGRESS
-- ============================================
create table progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  module_id uuid not null references modules(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique(user_id, module_id)
);

alter table progress enable row level security;

create index idx_progress_user_id on progress(user_id);
create index idx_progress_module_id on progress(module_id);

-- ============================================
-- RLS POLICIES (permissive for Phase 0, tighten in Phase 1)
-- ============================================

-- Profiles: users can read their own, admins can read all
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Courses: anyone authenticated can read, admins can do everything
create policy "Authenticated users can view courses"
  on courses for select
  using (auth.role() = 'authenticated');

create policy "Admins can insert courses"
  on courses for insert
  with check (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update courses"
  on courses for update
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete courses"
  on courses for delete
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Modules: authenticated users can read, admins can manage
create policy "Authenticated users can view modules"
  on modules for select
  using (auth.role() = 'authenticated');

create policy "Admins can insert modules"
  on modules for insert
  with check (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update modules"
  on modules for update
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete modules"
  on modules for delete
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Materials: authenticated users can read, admins can manage
create policy "Authenticated users can view materials"
  on materials for select
  using (auth.role() = 'authenticated');

create policy "Admins can insert materials"
  on materials for insert
  with check (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update materials"
  on materials for update
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete materials"
  on materials for delete
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Quizzes: authenticated users can read, admins can manage
create policy "Authenticated users can view quizzes"
  on quizzes for select
  using (auth.role() = 'authenticated');

create policy "Admins can insert quizzes"
  on quizzes for insert
  with check (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update quizzes"
  on quizzes for update
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete quizzes"
  on quizzes for delete
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Quiz Questions: authenticated users can read, admins can manage
create policy "Authenticated users can view quiz questions"
  on quiz_questions for select
  using (auth.role() = 'authenticated');

create policy "Admins can insert quiz questions"
  on quiz_questions for insert
  with check (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update quiz questions"
  on quiz_questions for update
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete quiz questions"
  on quiz_questions for delete
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Enrollments: users can view their own, admins can view all and manage
create policy "Users can view own enrollments"
  on enrollments for select
  using (auth.uid() = user_id);

create policy "Admins can view all enrollments"
  on enrollments for select
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert enrollments"
  on enrollments for insert
  with check (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update enrollments"
  on enrollments for update
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Quiz Attempts: users can view/insert their own, admins can view all
create policy "Users can view own quiz attempts"
  on quiz_attempts for select
  using (auth.uid() = user_id);

create policy "Users can insert own quiz attempts"
  on quiz_attempts for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all quiz attempts"
  on quiz_attempts for select
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

-- Progress: users can view their own, admins can view all and manage
create policy "Users can view own progress"
  on progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on progress for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all progress"
  on progress for select
  using (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert progress"
  on progress for insert
  with check (
    exists (
      select 1 from profiles where id = auth.uid() and role = 'admin'
    )
  );
