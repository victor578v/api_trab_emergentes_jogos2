-- CreateTable
CREATE TABLE "jogos" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(100) NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "lancamento" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT,
    "imagem" TEXT,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoriaId" INTEGER NOT NULL,
    "desenvolvedoraId" INTEGER NOT NULL,

    CONSTRAINT "jogos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(50) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "desenvolvedoras" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,

    CONSTRAINT "desenvolvedoras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plataformas" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(50) NOT NULL,

    CONSTRAINT "plataformas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jogos_plataformas" (
    "id" SERIAL NOT NULL,
    "jogoId" INTEGER NOT NULL,
    "plataformaId" INTEGER NOT NULL,

    CONSTRAINT "jogos_plataformas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "recSenha" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cliente_jogos" (
    "clienteId" INTEGER NOT NULL,
    "jogoId" INTEGER NOT NULL,

    CONSTRAINT "cliente_jogos_pkey" PRIMARY KEY ("clienteId","jogoId")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- AddForeignKey
ALTER TABLE "jogos" ADD CONSTRAINT "jogos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos" ADD CONSTRAINT "jogos_desenvolvedoraId_fkey" FOREIGN KEY ("desenvolvedoraId") REFERENCES "desenvolvedoras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos_plataformas" ADD CONSTRAINT "jogos_plataformas_jogoId_fkey" FOREIGN KEY ("jogoId") REFERENCES "jogos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jogos_plataformas" ADD CONSTRAINT "jogos_plataformas_plataformaId_fkey" FOREIGN KEY ("plataformaId") REFERENCES "plataformas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_jogos" ADD CONSTRAINT "cliente_jogos_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente_jogos" ADD CONSTRAINT "cliente_jogos_jogoId_fkey" FOREIGN KEY ("jogoId") REFERENCES "jogos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
