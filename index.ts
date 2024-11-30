import express from 'express';
import jogosRoutes from './routes/jogos';
import plataformasRoutes from './routes/plataformas';
import categoriasRoutes from './routes/categorias';
import desenvolvedorasRoutes from './routes/desenvolvedoras';
import clientesRoutes from './routes/clientes';
import adminsRoutes from './routes/admins';
import dashboardRoutes from './routes/dashboard';
import cors from 'cors';

const app = express()
const port = 3004

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use("/jogos", jogosRoutes)
app.use("/plataformas", plataformasRoutes)
app.use("/categorias", categoriasRoutes)
app.use("/desenvolvedoras", desenvolvedorasRoutes)
app.use("/clientes", clientesRoutes)
app.use("/admins", adminsRoutes)
app.use("/dashboard", dashboardRoutes)

app.get('/', (req, res) => {
  res.send('API: Loja de Jogos')
})

app.listen(port, () => {
  console.log(`Servidor rodando na porta: ${port}`)
})
