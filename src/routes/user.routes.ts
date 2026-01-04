import { Router } from 'express';

const userRoutes = Router();

userRoutes.post('/', async (req, res) => {
  return res.status(201).json({
    message: 'Usuário criado com sucesso',
    data: req.body,
  });
});

export default userRoutes;
