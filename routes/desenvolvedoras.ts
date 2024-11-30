import { PrismaClient } from "@prisma/client"
import { Router } from "express"


const prisma = new PrismaClient()
const router = Router()

// Listar todas as desenvolvedoras
router.get("/", async (req, res) => {
  try {
    const desenvolvedoras = await prisma.desenvolvedora.findMany()
    res.status(200).json(desenvolvedoras)
  } catch (error) {
    res.status(400).json(error)
  }
})

router.get("/:id", async (req, res) => {
  const { id } = req.params

  try {
      // Converte o id de string para número
      const desenvolvedoraId = parseInt(id, 10)

      // Valida se a conversão foi bem-sucedida
      if (isNaN(desenvolvedoraId)) {
          return res.status(400).json({ erro: "ID inválido" })
      }

      const desenvolvedora = await prisma.desenvolvedora.findUnique({
          where: { id: desenvolvedoraId } // Usa o ID convertido
      })

      if (!desenvolvedora) {
          res.status(400).json({ erro: "Cliente não cadastrado" })
      } else {
          res.status(200).json({
              id: desenvolvedora.id,
              nome: desenvolvedora.nome
          })
      }
  } catch (error) {
      res.status(400).json(error)
  }
})

// Criar uma nova desenvolvedora
router.post("/", async (req, res) => {
  const { nome } = req.body

  if (!nome) {
    res.status(400).json({ "erro": "Informe nome da desenvolvedora" })
    return
  }

  try {
    const desenvolvedora = await prisma.desenvolvedora.create({
      data: { nome }
    })
    res.status(201).json(desenvolvedora)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Deletar uma desenvolvedora pelo ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const desenvolvedora = await prisma.desenvolvedora.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(desenvolvedora)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Atualizar uma desenvolvedora pelo ID
router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { nome } = req.body

  if (!nome) {
    res.status(400).json({ "erro": "Informe nome da desenvolvedora" })
    return
  }

  try {
    const desenvolvedora = await prisma.desenvolvedora.update({
      where: { id: Number(id) },
      data: { nome }
    })
    res.status(200).json(desenvolvedora)
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
