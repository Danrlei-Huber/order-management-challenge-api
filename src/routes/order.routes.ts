import { Router, type Request, type Response } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { advanceOrderState, createOrder, listOrders } from '../modules/order/order.service.js';

const odersRouter = Router();

/**
 * POST /orders
 * Criação do pedido    
 */
odersRouter.post(
  '/',
  authMiddleware,
  async (req: Request, res: Response) => {
    return createOrder(req, res);
  }
);

/**
 * GET /orders
 * Listagem com paginação e filtro por state
 */
odersRouter.get(
  '/',
  authMiddleware,
  async (req: Request, res: Response) => {
    return listOrders(req, res);
  }
);

/** PATCH /orders/:id/advance
 * Avança o estado do pedido
 */
odersRouter.patch('/:id/advance', authMiddleware, async (req: Request, res: Response) => {
  return advanceOrderState(req, res);
});

export default odersRouter;
