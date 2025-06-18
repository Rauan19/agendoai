import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import db from '../db/connection.js';
import { users } from '../db/schema.js';

const router = express.Router();

// Registrar usuário
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    // Validar campos obrigatórios
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ 
        error: 'Nome, email, senha e tipo de usuário são obrigatórios' 
      });
    }

    // Verificar se o email já existe
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        userType,
        isActive: true
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        userType: users.userType,
        createdAt: users.createdAt
      });

    // Gerar JWT
    const token = jwt.sign(
      { 
        userId: newUser[0].id, 
        email: newUser[0].email,
        userType: newUser[0].userType 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: newUser[0],
      token
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }

    // Buscar usuário
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar se usuário está ativo
    if (!user[0].isActive) {
      return res.status(401).json({ error: 'Conta desativada' });
    }

    // Gerar JWT
    const token = jwt.sign(
      { 
        userId: user[0].id, 
        email: user[0].email,
        userType: user[0].userType 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userResponse = {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      userType: user[0].userType,
      avatar: user[0].avatar,
      phone: user[0].phone
    };

    res.json({
      message: 'Login realizado com sucesso',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Verificar token e obter dados do usuário
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        userType: users.userType,
        avatar: users.avatar,
        phone: users.phone,
        isActive: users.isActive
      })
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (user.length === 0 || !user[0].isActive) {
      return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
    }

    res.json({ user: user[0] });

  } catch (error) {
    console.error('Erro na verificação do token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Logout (invalidar token no frontend)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

export default router;