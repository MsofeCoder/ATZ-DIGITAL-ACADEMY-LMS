-- ATZ Digital Academy LMS — Fix infinite recursion in profiles RLS policy
-- Migration: 20260824000000_fix_profiles_recursion.sql
--
-- Problem: "Admins can view all profiles" policy on the profiles table uses
--   exists (select 1 from profiles where ...) — a subquery against the same
--   table it's policies on. Postgres re-evaluates the policy for the subquery,
--   causing infinite recursion.
--
-- Fix: Create a SECURITY DEFINER function is_admin() that checks role via a
--   query that bypasses RLS. Replace all inline profiles subqueries with it.

begin;

-- ============================================
-- 1. Create is_admin() SECURITY DEFINER function
-- ============================================
-- Runs as the function owner (postgres), bypasses RLS entirely.
-- The inner SELECT on profiles does NOT trigger any policies.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================
-- 2. Profiles — fix the recursive policy
-- ============================================
-- "Users can view own profile" and "Users can update own profile" use
-- auth.uid() = id — no self-reference, safe. Leave them alone.

drop policy if exists "Admins can view all profiles" on profiles;

create policy "Admins can view all profiles"
  on profiles for select
  using (is_admin());

-- ============================================
-- 3. Courses — replace inline subqueries with is_admin()
-- ============================================
drop policy if exists "Admins can insert courses" on courses;
create policy "Admins can insert courses"
  on courses for insert
  with check (is_admin());

drop policy if exists "Admins can update courses" on courses;
create policy "Admins can update courses"
  on courses for update
  using (is_admin());

drop policy if exists "Admins can delete courses" on courses;
create policy "Admins can delete courses"
  on courses for delete
  using (is_admin());

-- ============================================
-- 4. Modules — replace inline subqueries with is_admin()
-- ============================================
drop policy if exists "Admins can insert modules" on modules;
create policy "Admins can insert modules"
  on modules for insert
  with check (is_admin());

drop policy if exists "Admins can update modules" on modules;
create policy "Admins can update modules"
  on modules for update
  using (is_admin());

drop policy if exists "Admins can delete modules" on modules;
create policy "Admins can delete modules"
  on modules for delete
  using (is_admin());

-- ============================================
-- 5. Materials — replace inline subqueries with is_admin()
-- ============================================
drop policy if exists "Admins can insert materials" on materials;
create policy "Admins can insert materials"
  on materials for insert
  with check (is_admin());

drop policy if exists "Admins can update materials" on materials;
create policy "Admins can update materials"
  on materials for update
  using (is_admin());

drop policy if exists "Admins can delete materials" on materials;
create policy "Admins can delete materials"
  on materials for delete
  using (is_admin());

-- ============================================
-- 6. Quizzes — replace inline subqueries with is_admin()
-- ============================================
drop policy if exists "Admins can insert quizzes" on quizzes;
create policy "Admins can insert quizzes"
  on quizzes for insert
  with check (is_admin());

drop policy if exists "Admins can update quizzes" on quizzes;
create policy "Admins can update quizzes"
  on quizzes for update
  using (is_admin());

drop policy if exists "Admins can delete quizzes" on quizzes;
create policy "Admins can delete quizzes"
  on quizzes for delete
  using (is_admin());

-- ============================================
-- 7. Quiz Questions — replace inline subqueries with is_admin()
-- ============================================
drop policy if exists "Admins can insert quiz questions" on quiz_questions;
create policy "Admins can insert quiz questions"
  on quiz_questions for insert
  with check (is_admin());

drop policy if exists "Admins can update quiz questions" on quiz_questions;
create policy "Admins can update quiz questions"
  on quiz_questions for update
  using (is_admin());

drop policy if exists "Admins can delete quiz questions" on quiz_questions;
create policy "Admins can delete quiz questions"
  on quiz_questions for delete
  using (is_admin());

-- ============================================
-- 8. Enrollments — replace inline subqueries with is_admin()
-- ============================================
drop policy if exists "Admins can view all enrollments" on enrollments;
create policy "Admins can view all enrollments"
  on enrollments for select
  using (is_admin());

drop policy if exists "Admins can insert enrollments" on enrollments;
create policy "Admins can insert enrollments"
  on enrollments for insert
  with check (is_admin());

drop policy if exists "Admins can update enrollments" on enrollments;
create policy "Admins can update enrollments"
  on enrollments for update
  using (is_admin());

-- ============================================
-- 9. Quiz Attempts — replace inline subqueries with is_admin()
-- ============================================
drop policy if exists "Admins can view all quiz attempts" on quiz_attempts;
create policy "Admins can view all quiz attempts"
  on quiz_attempts for select
  using (is_admin());

-- ============================================
-- 10. Progress — replace inline subqueries with is_admin()
-- ============================================
drop policy if exists "Admins can view all progress" on progress;
create policy "Admins can view all progress"
  on progress for select
  using (is_admin());

drop policy if exists "Admins can insert progress" on progress;
create policy "Admins can insert progress"
  on progress for insert
  with check (is_admin());

commit;
