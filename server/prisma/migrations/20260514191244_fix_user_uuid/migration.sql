-- Drop ALL RLS policies that may depend on affected columns
DROP POLICY IF EXISTS "Places are public" ON "places";
DROP POLICY IF EXISTS "Quiz questions are public" ON "quiz_questions";
DROP POLICY IF EXISTS "Users can view own profile" ON "users";
DROP POLICY IF EXISTS "Users can update own profile" ON "users";
DROP POLICY IF EXISTS "Users manage own bookmarks" ON "bookmarks";
DROP POLICY IF EXISTS "Users manage own scores" ON "quiz_scores";

-- Drop foreign keys
ALTER TABLE "bookmarks" DROP CONSTRAINT IF EXISTS "bookmarks_userId_fkey";
ALTER TABLE "quiz_scores" DROP CONSTRAINT IF EXISTS "quiz_scores_userId_fkey";

-- AlterTable users
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN "id" UUID NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- Convert userId columns to UUID in dependent tables
ALTER TABLE "bookmarks" ALTER COLUMN "userId" TYPE UUID USING "userId"::UUID;
ALTER TABLE "quiz_scores" ALTER COLUMN "userId" TYPE UUID USING "userId"::UUID;

-- Re-add foreign keys
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "quiz_scores" ADD CONSTRAINT "quiz_scores_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Re-add ALL RLS policies
CREATE POLICY "Places are public" ON "places"
  FOR SELECT USING (true);
CREATE POLICY "Quiz questions are public" ON "quiz_questions"
  FOR SELECT USING (true);
CREATE POLICY "Users can view own profile" ON "users"
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON "users"
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users manage own bookmarks" ON "bookmarks"
  FOR ALL USING (auth.uid() = "userId");
CREATE POLICY "Users manage own scores" ON "quiz_scores"
  FOR ALL USING (auth.uid() = "userId");
