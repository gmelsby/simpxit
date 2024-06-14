-- CreateTable
CREATE TABLE "Card" (
    "id" BIGSERIAL NOT NULL,
    "subtitles" TEXT[],
    "locator" TEXT NOT NULL,
    "episode_id" BIGINT NOT NULL,
    "frinkiac_link" TEXT,
    "timestamp" BIGINT NOT NULL,

    CONSTRAINT "card_pkey1" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Episode" (
    "id" BIGSERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "director" TEXT NOT NULL,
    "writer" TEXT NOT NULL,
    "airdate" TEXT NOT NULL,
    "season_number" SMALLINT NOT NULL,
    "episode_number" SMALLINT NOT NULL,

    CONSTRAINT "card_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "public_card_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "Episode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

