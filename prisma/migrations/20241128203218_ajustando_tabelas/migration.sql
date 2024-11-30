/*
  Warnings:

  - You are about to drop the `jogos_plataformas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "jogos_plataformas" DROP CONSTRAINT "jogos_plataformas_jogoId_fkey";

-- DropForeignKey
ALTER TABLE "jogos_plataformas" DROP CONSTRAINT "jogos_plataformas_plataformaId_fkey";

-- DropTable
DROP TABLE "jogos_plataformas";

-- CreateTable
CREATE TABLE "_JogoToPlataforma" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_JogoToPlataforma_AB_unique" ON "_JogoToPlataforma"("A", "B");

-- CreateIndex
CREATE INDEX "_JogoToPlataforma_B_index" ON "_JogoToPlataforma"("B");

-- AddForeignKey
ALTER TABLE "_JogoToPlataforma" ADD CONSTRAINT "_JogoToPlataforma_A_fkey" FOREIGN KEY ("A") REFERENCES "jogos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JogoToPlataforma" ADD CONSTRAINT "_JogoToPlataforma_B_fkey" FOREIGN KEY ("B") REFERENCES "plataformas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
