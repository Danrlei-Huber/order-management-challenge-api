import type { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('💥 ERRO GLOBAL:', err);

  res.status(500).json({
    message: err.message || 'Erro interno do servidor',
  });
}
