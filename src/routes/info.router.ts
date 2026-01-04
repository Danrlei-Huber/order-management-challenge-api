import { Router } from 'express';


const infoRouter = Router();

infoRouter.get('/', (req, res) => {
  res.json({
    name: 'Order Management API',
    version: '1.0.0',
    description: 'API para gerenciamento de pedidos',
  });
});

export default infoRouter;
