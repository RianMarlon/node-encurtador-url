-- CreateTable
CREATE TABLE "url_shorteners" (
    "id" TEXT NOT NULL,
    "url_key" CHAR(6) NOT NULL,
    "original_url" VARCHAR(255) NOT NULL,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pk_url_shorteners" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uniq_url_shorteners_url_key" ON "url_shorteners"("url_key");
