import { PrismaClient } from "@prisma/client"
import { Router } from "express"

const prisma = new PrismaClient()
const router = Router()

// Listar todas as categorias
router.get("/", async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany()
    res.status(200).json(categorias)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Criar uma nova categoria
router.post("/", async (req, res) => {
  const { nome } = req.body

  if (!nome) {
    res.status(400).json({ "erro": "Informe nome da categoria" })
    return
  }

  try {
    const categoria = await prisma.categoria.create({
      data: { nome }
    })
    res.status(201).json(categoria)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Deletar uma categoria pelo ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const categoria = await prisma.categoria.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(categoria)
  } catch (error) {
    res.status(400).json(error)
  }
})

// Atualizar uma categoria pelo ID
router.put("/:id", async (req, res) => {
  const { id } = req.params
  const { nome } = req.body

  if (!nome) {
    res.status(400).json({ "erro": "Informe nome da categoria" })
    return
  }

  try {
    const categoria = await prisma.categoria.update({
      where: { id: Number(id) },
      data: { nome }
    })
    res.status(200).json(categoria)
  } catch (error) {
    res.status(400).json(error)
  }
})

export default router
