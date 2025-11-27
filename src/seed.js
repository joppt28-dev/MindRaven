// server/src/seed.js
const bcrypt = require('bcryptjs');
const supabase = require('./supabase'); // Importamos tu cliente de Supabase

const createTestUser = async () => {
  console.log('🌱 Creando usuario de prueba...');

  const testUser = {
    name: 'Usuario Prueba',
    email: 'demo@mindraven.ai',
    password: 'MindRaven2025', // Esta será la contraseña para loguearte
    role: 'innovator'
  };

  try {
    // 1. Verificar si ya existe para no duplicar
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', testUser.email)
      .single();

    if (existing) {
      console.log('⚠️ El usuario de prueba YA existe. No se hizo nada.');
      process.exit(0);
    }

    // 2. Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(testUser.password, salt);

    // 3. Insertar en Supabase
    const { error } = await supabase
      .from('users')
      .insert([
        {
          name: testUser.name,
          email: testUser.email,
          password: hashedPassword,
          role: testUser.role
        }
      ]);

    if (error) throw error;

    console.log('✅ ¡ÉXITO! Usuario de prueba creado.');
    console.log('📧 Email: demo@mindraven.ai');
    console.log('🔑 Pass:  MindRaven2025');

  } catch (error) {
    console.error('❌ Error creando usuario:', error.message);
  } finally {
    process.exit(0); // Cierra el script
  }
};

createTestUser();