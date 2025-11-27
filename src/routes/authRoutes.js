const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../supabase'); // Importamos la conexión que acabamos de crear

const router = express.Router();

// Función auxiliar para generar el token
const issueToken = (user) => {
  return jwt.sign(
    { sub: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};

// --- REGISTER (CREAR CUENTA) ---
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // 1. Verificar si el usuario ya existe (Buscamos por email)
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado.' });
    }

    // 2. Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insertar en PostgreSQL (Supabase)
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name: name,
          email: email,
          password: hashedPassword,
          role: 'innovator'
        },
      ])
      .select() // Pedimos que nos devuelva el dato creado
      .single();

    if (error) throw error;

    // 4. Generar Token y Responder
    const user = data;
    const token = issueToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error en el servidor', details: error.message });
  }
});

// --- LOGIN (INICIAR SESIÓN) ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan credenciales.' });
    }

    // 1. Buscar usuario por email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 2. Comparar contraseña (la que escribió vs la encriptada)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 3. Generar Token
    const token = issueToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;