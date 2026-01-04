import 'dotenv/config';

import app from './app.js';
import { connectMongo } from './config/database.js';

async function startServer() {
  try {
    await connectMongo();
    app.listen(3000, () => {
      console.log('🚀 Servidor rodando');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();
