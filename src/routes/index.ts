import { Router } from 'express';
import userRoutes from './user.routes.js';
import infoRouter from './info.router.js';
import odersRouter from './order.routes.js';

const routes = Router();

routes.use('/users', userRoutes);
routes.use('/info', infoRouter);
routes.use('/orders', odersRouter);

export { routes };
