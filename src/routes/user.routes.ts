import { Router } from 'express';
import { login, registerUser } from '../modules/user/user.service.js';

const userRoutes = Router();

/** POST /users/login
 * User login
 */
userRoutes.post('/login', async (req, res) => {
  return login(req, res);
});

/** POST /users/register
 * Register a new user
 */
userRoutes.post('/register', async (req, res) => {
  return registerUser(req, res);
});

export default userRoutes;
