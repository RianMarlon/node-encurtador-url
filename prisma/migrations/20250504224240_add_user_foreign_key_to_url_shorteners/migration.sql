-- AlterTable
ALTER TABLE "url_shorteners" ADD COLUMN     "user_id" TEXT;

-- AddForeignKey
ALTER TABLE "url_shorteners" ADD CONSTRAINT "fk_url_shorteners_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
