import { PrismaClient } from "@prisma/client"
import { Router } from "express"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"

const prisma = new PrismaClient()
const router = Router()

// Rota para obter todos os clientes
router.get("/", async (req, res) => {
    try {
        const clientes = await prisma.cliente.findMany()
        res.status(200).json(clientes)
    } catch (error) {
        res.status(400).json({ "erro": "Erro ao pegar os usuarios" })
    }
})

async function enviaEmail(nome: string, email: string, chaveRecuperacao: string) {
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io", // Substitua pelo seu servidor de e-mail
        port: 587,
        secure: false,
        auth: {
            user: "b5243fb71e418d", // Substitua com seu usuário Mailtrap
            pass: "4432f65c6eed2f"   // Substitua com sua senha Mailtrap
        }
    });

    const info = await transporter.sendMail({
        from: 'victorandreimaciel67@gmail.com', // Remetente
        to: email, // Destinatário
        subject: "Chave de Recuperação de Senha", // Assunto do e-mail
        text: `Sua chave de recuperação é: ${chaveRecuperacao}`, // Corpo do e-mail
        html: `<h3>Estimado Cliente: ${nome}</h3>
             <p>Utilize a chave de recuperação abaixo para redefinir sua senha:</p>
             <h4>${chaveRecuperacao}</h4>
             <p>Se você não solicitou a recuperação de senha, desconsidere este e-mail.</p>`
    });

    console.log("Message sent: %s", info.messageId);
}

router.post("/recuperar-senha", async (req, res) => {
    const { email } = req.body; // O e-mail do cliente para recuperar a senha

    if (!email) {
        return res.status(400).json({ error: "E-mail é necessário" });
    }

    try {
        // Verificar se o cliente existe
        const cliente = await prisma.cliente.findUnique({
            where: { email },
        });

        if (!cliente) {
            return res.status(404).json({ error: "Cliente não encontrado" });
        }

        // Gerar uma chave de recuperação aleatória
        const chaveRecuperacao = Date.now().toString(); // Usando o valor original sem hash

        // Gerar o hash para armazenar no banco de dados
        const chaveRecuperacaoHash = bcrypt.hashSync(chaveRecuperacao, 10);

        // Atualizar a chave de recuperação no banco de dados
        await prisma.cliente.update({
            where: { email },
            data: { recSenha: chaveRecuperacaoHash }
        });

        // Enviar o e-mail com a chave de recuperação original
        await enviaEmail(cliente.nome, cliente.email, chaveRecuperacao); // Enviar a chave original no e-mail

        res.status(200).json({ message: "E-mail enviado com sucesso!" });
    } catch (error) {
        console.error("Erro ao recuperar senha:", error);
        res.status(500).json({ error: "Erro ao enviar o e-mail de recuperação" });
    }
});


function validaSenha(senha: string) {

    const mensa: string[] = []

    // .length: retorna o tamanho da string (da senha)
    if (senha.length < 8) {
        mensa.push("Erro... senha deve possuir, no mínimo, 8 caracteres")
    }

    // contadores
    let pequenas = 0
    let grandes = 0
    let numeros = 0
    let simbolos = 0

    // senha = "abc123"
    // letra = "a"

    // percorre as letras da variável senha
    for (const letra of senha) {
        // expressão regular
        if ((/[a-z]/).test(letra)) {
            pequenas++
        }
        else if ((/[A-Z]/).test(letra)) {
            grandes++
        }
        else if ((/[0-9]/).test(letra)) {
            numeros++
        } else {
            simbolos++
        }
    }

    if (pequenas == 0 || grandes == 0 || numeros == 0 || simbolos == 0) {
        mensa.push("Erro... senha deve possuir letras minúsculas, maiúsculas, números e símbolos")
    }

    return mensa
}

async function verificarCodigoDeRecuperacao(email: string, codigo: string): Promise<boolean> {
    const cliente = await prisma.cliente.findUnique({
      where: { email },
    });
  
    if (!cliente || !cliente.recSenha) {
      return false; // Se o cliente não existir ou não tiver a chave de recuperação
    }
  
    // Comparar o código fornecido (em texto simples) com o hash armazenado
    const isCodigoValido = bcrypt.compareSync(codigo, cliente.recSenha);
  
    return isCodigoValido; // Retorna true ou false dependendo da comparação
  }
  

async function alterarSenha(email: string, novaSenha: string): Promise<void> {
    const senhaCriptografada = bcrypt.hashSync(novaSenha, 10);

    await prisma.cliente.update({
        where: { email },
        data: { senha: senhaCriptografada, recSenha: null }
    });
}


router.post('/validar-recuperacao', async (req, res) => {
    const { email, codigo, novaSenha }: { email: string, codigo: string, novaSenha: string } = req.body;

    // Verificar se o código de recuperação e o e-mail são válidos
    const isCodigoValido = await verificarCodigoDeRecuperacao(email, codigo);

    if (!isCodigoValido) {
        return res.status(400).json({ message: "Código de recuperação inválido." });
    }

    // Validação da nova senha
    const erros = validaSenha(novaSenha);
    if (erros.length > 0) {
        return res.status(400).json({ message: erros.join(' ') });
    }

    // Alterar a senha no banco de dados
    await alterarSenha(email, novaSenha);

    res.status(200).json({ message: "Senha alterada com sucesso." });
});


router.post("/cadastrar", async (req, res) => {
    const { nome, email, senha } = req.body

    if (!nome || !email || !senha) {
        res.status(400).json({ erro: "Informe nome, email e senha" })
        return
    }

    const erros = validaSenha(senha)
    if (erros.length > 0) {
        res.status(400).json({ erro: erros.join("; ") })
        return
    }

    // 12 é o número de voltas (repetições) que o algoritmo faz
    // para gerar o salt (sal/tempero)
    const salt = bcrypt.genSaltSync(12)
    // gera o hash da senha acrescida do salt
    const hash = bcrypt.hashSync(senha, salt)

    // para o campo senha, atribui o hash gerado
    try {
        const cliente = await prisma.cliente.create({
            data: { nome, email, senha: hash }
        })
        res.status(201).json(cliente)
    } catch (error) {
        res.status(400).json(error)
    }
})

router.post("/login", async (req, res) => {
    const { email, senha } = req.body

    // em termos de segurança, o recomendado é exibir uma mensagem padrão
    // a fim de evitar de dar "dicas" sobre o processo de login para hackers
    const mensaPadrao = "Login ou senha incorretos"

    if (!email || !senha) {
        // res.status(400).json({ erro: "Informe e-mail e senha do usuário" })
        res.status(400).json({ erro: mensaPadrao })
        return
    }

    try {
        const cliente = await prisma.cliente.findUnique({
            where: { email }
        })

        if (cliente == null) {
            // res.status(400).json({ erro: "E-mail inválido" })
            res.status(400).json({ erro: mensaPadrao })
            return
        }

        // se o e-mail existe, faz-se a comparação dos hashs
        if (bcrypt.compareSync(senha, cliente.senha)) {
            res.status(200).json({
                id: cliente.id,
                nome: cliente.nome,
                email: cliente.email
            })
        } else {
            // res.status(400).json({ erro: "Senha incorreta" })

            res.status(400).json({ erro: mensaPadrao })
        }
    } catch (error) {
        res.status(400).json(error)
    }
})

router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        // Converte o id de string para número
        const clienteId = parseInt(id, 10);

        // Valida se a conversão foi bem-sucedida
        if (isNaN(clienteId)) {
            return res.status(400).json({ erro: "ID inválido" });
        }

        const cliente = await prisma.cliente.findUnique({
            where: { id: clienteId }, // Usa o ID convertido
            include: {
                jogos: true // Inclui os jogos relacionados
            },
        });

        if (!cliente) {
            res.status(400).json({ erro: "Cliente não cadastrado" });
        } else {
            res.status(200).json({
                id: cliente.id,
                nome: cliente.nome,
                email: cliente.email,
                totalJogos: cliente.jogos.length, // Conta o número de jogos
            });
        }
    } catch (error) {
        console.error("Erro ao buscar cliente:", error);
        res.status(500).json({ erro: "Erro interno do servidor" });
    }
});


router.post("/comprar", async (req, res) => {
    const { clienteId, jogoId } = req.body;

    try {
        // Verificar se o cliente já tem o jogo
        const clienteJogo = await prisma.clienteJogo.findUnique({
            where: {
                clienteId_jogoId: { clienteId, jogoId },
            },
        });

        if (clienteJogo) {
            return res.status(400).json({ erro: "O cliente já possui este jogo." });
        }

        // Registrar a compra, adicionando o jogo à lista do cliente
        await prisma.clienteJogo.create({
            data: {
                clienteId,
                jogoId,
            },
        });

        res.status(201).json({ mensagem: "Jogo comprado com sucesso!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao registrar a compra." });
    }
});

router.get('/:clienteId/jogos', async (req, res) => {
    const { clienteId } = req.params;

    try {
        // Buscar os jogos do cliente
        const jogos = await prisma.clienteJogo.findMany({
            where: {
                clienteId: Number(clienteId),
            },
            include: {
                jogo: true, // Inclui os detalhes do jogo
            },
        });

        // Se não houver jogos, retorne uma mensagem apropriada
        if (jogos.length === 0) {
            return res.status(404).json({ mensagem: "Nenhum jogo encontrado para este cliente." });
        }

        // Retornar a lista de jogos do cliente
        res.status(200).json(jogos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao buscar jogos do cliente." });
    }
});

export default router
