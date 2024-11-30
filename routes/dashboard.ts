import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient();
const router = Router();

// Rota para dados gerais
router.get("/gerais", async (req, res) => {
  try {
    const clientes = await prisma.cliente.count();
    const jogos = await prisma.jogo.count();
    const vendas = await prisma.clienteJogo.count(); // Assumindo que vendas são relações entre cliente e jogos
    res.status(200).json({ clientes, jogos, vendas });
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get("/quantidade-jogos-plataforma", async (req, res) => {
  try {
    // Consulta para contar os jogos por plataforma
    const plataformasComContagem = await prisma.plataforma.findMany({
      include: {
        jogos: {
          select: { id: true },
        },
      },
    });

    // Formatar o resultado para exibir plataforma com a quantidade de jogos
    const resultado = plataformasComContagem.map(plataforma => ({
      plataforma: plataforma.nome,
      quantidadeJogos: plataforma.jogos.length,
    }));

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao contar jogos por plataforma", detalhes: error });
  }
});

router.get("/quantidade-jogos-desenvolvedora", async (req, res) => {
  try {
    // Consulta para contar os jogos por desenvolvedora
    const desenvolvedorasComContagem = await prisma.desenvolvedora.findMany({
      include: {
        jogos: {
          select: { id: true },
        },
      },
    });

    // Formatar o resultado para exibir desenvolvedora com a quantidade de jogos
    const resultado = desenvolvedorasComContagem.map(desenvolvedora => ({
      desenvolvedora: desenvolvedora.nome,
      quantidadeJogos: desenvolvedora.jogos.length,
    }));

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao contar jogos por desenvolvedora", detalhes: error });
  }
});

router.get("/quantidade-jogos-desenvolvedora-plataforma", async (req, res) => {
  try {
    // Consulta para contar os jogos por desenvolvedora e plataforma
    const desenvolvedorasComPlataformas = await prisma.desenvolvedora.findMany({
      include: {
        jogos: {
          include: {
            plataformas: {
              select: { id: true, nome: true },
            },
          },
        },
      },
    });

    // Formatar o resultado para exibir desenvolvedora, plataforma e a quantidade de jogos
    const resultado = desenvolvedorasComPlataformas.map(desenvolvedora => {
      const plataformasContagem = desenvolvedora.jogos.reduce((acc: any, jogo) => {
        jogo.plataformas.forEach(plataforma => {
          if (!acc[plataforma.nome]) {
            acc[plataforma.nome] = 0;
          }
          acc[plataforma.nome]++;
        });
        return acc;
      }, {});

      return {
        desenvolvedora: desenvolvedora.nome,
        plataformas: Object.entries(plataformasContagem).map(([plataforma, quantidadeJogos]) => ({
          plataforma,
          quantidadeJogos,
        })),
      };
    });

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao contar jogos por desenvolvedora e plataforma", detalhes: error });
  }
});



export default router;
