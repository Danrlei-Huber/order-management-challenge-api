import { Router } from 'express';
import userRoutes from './user.routes.js';
import infoRouter from './info.router.js';

const routes = Router();

routes.use('/users', userRoutes);
routes.use('/info', infoRouter);

export { routes };
