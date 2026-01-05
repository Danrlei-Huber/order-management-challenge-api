import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectMongo(): Promise<void> {
  try {
    await mongoose.connect(env.mongoUri);

    console.log('MongoDB conectado com sucesso');
  } catch (error) {
    console.error('Erro ao conectar no MongoDB:', error);
    process.exit(1);
  }
}
