import express from 'express';
import type { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { routes } from './routes/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';


export class App {
  public app: Application;

  constructor() {
    this.app = express();

    this.initializeMiddlewares();
    this.initializeRoutes();
  }

  private initializeMiddlewares(): void {
    // Parse de JSON
    this.app.use(express.json());
    // Parse de dados URL-encoded
    this.app.use(express.urlencoded({ extended: true }));
    // Habilita CORS
    this.app.use(cors());
    // Logger de requisições (útil em dev)
    this.app.use(morgan('dev'));
    // Logger de erros
    this.app.use(errorMiddleware);
  }

  private initializeRoutes(): void {
    this.app.use('/api', routes);
  }

}

export default new App().app;
