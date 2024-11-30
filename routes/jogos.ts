import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import { verificaToken } from "../middewares/verificaToken"

const prisma = new PrismaClient()
const router = Router()

// Rotas para Jogos

router.get("/", async (req, res) => {
  try {
    const jogos = await prisma.jogo.findMany({
      include: {
        categoria: true,
        desenvolvedora: true,
        plataformas: true
      }
    })
    res.status(200).json(jogos)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.post("/", verificaToken, async (req, res) => {
  const {
    titulo,
    preco,
    lancamento,
    descricao,
    imagem,
    destaque,
    categoriaId,
    desenvolvedoraId,
    plataformas,
    adminId
  }: {
    titulo: string;
    preco: number;
    lancamento: Date;
    descricao?: string;
    imagem?: string;
    destaque?: boolean;
    categoriaId: number;
    desenvolvedoraId: number;
    plataformas: number[];
    adminId: number
  } = req.body;


  if (!titulo || !preco || !lancamento || !categoriaId || !desenvolvedoraId) {
    res.status(400).json({
      erro: "Informe título, preço, lançamento, categoriaId e desenvolvedoraId",
    });
    return;
  }

  try {
    const jogo = await prisma.jogo.create({
      data: {
        titulo,
        preco,
        lancamento,
        descricao,
        imagem,
        destaque,
        categoriaId,
        desenvolvedoraId,
        adminId, // Passando o ID do admin para o campo 'adminId'
        plataformas: {
          connect: plataformas.map((plataformaId: number) => ({
            id: plataformaId,
          })),
        },
      },
      include: {
        categoria: true,
        desenvolvedora: true,
        plataformas: true, // Incluindo as plataformas corretamente
      },
    });
    res.status(201).json(jogo);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar jogo", detalhes: error });
  }
});




router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const jogo = await prisma.jogo.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(jogo)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.put("/destacar/:id", verificaToken, async (req, res) => {
  const { id } = req.params; // Pega o id do jogo da URL
  try {
    // Busca o jogo pelo ID
    const jogo = await prisma.jogo.findUnique({ where: { id: Number(id) } });

    if (!jogo) {
      return res.status(404).json({ error: "Jogo não encontrado" });
    }

    // Atualiza o status de destaque
    const updatedJogo = await prisma.jogo.update({
      where: { id: Number(id) },
      data: {
        destaque: !jogo.destaque, // Alterna o valor de destaque
      },
    });

    res.status(200).json(updatedJogo); // Retorna o jogo atualizado
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao alterar destaque do jogo" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    titulo,
    preco,
    lancamento,
    descricao,
    imagem,
    destaque,
    categoriaId,
    desenvolvedoraId,
    plataformas,
  }: {
    titulo: string;
    preco: number;
    lancamento: Date;
    descricao?: string;
    imagem?: string;
    destaque?: boolean;
    categoriaId: number;
    desenvolvedoraId: number;
    plataformas: number[];
  } = req.body;

  if (!titulo || !preco || !lancamento || !categoriaId || !desenvolvedoraId) {
    res.status(400).json({
      erro: "Informe título, preço, lançamento, categoriaId e desenvolvedoraId",
    });
    return;
  }

  try {
    const jogo = await prisma.jogo.update({
      where: { id: Number(id) },
      data: {
        titulo,
        preco,
        lancamento,
        descricao,
        imagem,
        destaque,
        categoriaId,
        desenvolvedoraId,
        plataformas: {
          set: plataformas.map((plataformaId: number) => ({
            id: plataformaId,
          })),
        },
      },
      include: {
        categoria: true,
        desenvolvedora: true,
        plataformas: true,
      },
    });
    res.status(200).json(jogo);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao atualizar jogo", detalhes: error });
  }
});


router.get("/pesquisa/:termo", async (req, res) => {
  const { termo } = req.params

  // tenta converter o termo em número
  const termoNumero = Number(termo)

  // se não é número (Not a Number)
  if (isNaN(termoNumero)) {

    try {
      const jogos = await prisma.jogo.findMany({
        include: {
          categoria: true,
          desenvolvedora: true,
          plataformas: true
        },
        where: {
          OR: [
            {
              titulo: { contains: termo }
            },
            {
              categoria: { nome: termo }
            },
            {
              desenvolvedora: { nome: termo }
            }
          ]
        }
      })
      res.status(200).json(jogos)
    } catch (error) {
      res.status(400).json(error)
    }

  } else {

    try {
      const jogos = await prisma.jogo.findMany({
        include: {
          categoria: true,
          desenvolvedora: true,
          plataformas: true
        },
        where: {
          OR: [
            {
              preco: { lte: termoNumero }
            }
          ]
        }
      })
      res.status(200).json(jogos)
    } catch (error) {
      res.status(400).json(error)
    }

  }

})

router.get("/:id", async (req, res) => {
  const { id } = req.params
  try {
    const jogo = await prisma.jogo.findUnique({
      where: { id: Number(id) },
      include: {
        categoria: true,
        desenvolvedora: true,
        plataformas: true
      }
    })
    res.status(200).json(jogo)
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
