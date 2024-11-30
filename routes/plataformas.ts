import { PrismaClient } from "@prisma/client"
import { Router } from "express"

// Configuração do Prisma Client com logs
const prisma = new PrismaClient()
const router = Router()

// Listar todas as plataformas
router.get("/", async (req, res) => {
  try {
    const plataformas = await prisma.plataforma.findMany()
    res.status(200).json(plataformas)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Criar uma nova plataforma
router.post("/", async (req, res) => {
  const { nome } = req.body

  if (!nome) {
    res.status(400).json({ "erro": "Informe nome da plataforma" })
    return
  }

  try {
    const plataforma = await prisma.plataforma.create({
      data: { nome }
    })
    res.status(201).json(plataforma)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Deletar uma plataforma pelo ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const plataforma = await prisma.plataforma.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(plataforma)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Atualizar uma plataforma pelo ID
router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { nome } = req.body

  if (!nome) {
    res.status(400).json({ "erro": "Informe nome da plataforma" })
    return
  }

  try {
    const plataforma = await prisma.plataforma.update({
      where: { id: Number(id) },
      data: { nome }
    })
    res.status(200).json(plataforma)
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
