import { Router } from 'express';

import { create, update, login } from '../controllers/auth';
import MonkeyBusinessModel from '../models/monkey-business';
import logger from '../logger';
import unroll from './unroll';
import { decodeJwt } from '../lib/tokens/tokens';

export default (): Router => {
  logger.info('Auth - POST,PATCH');
  const model = new MonkeyBusinessModel();
  const AuthRouter = Router();

  AuthRouter.post('/', unroll(create(model)));
  AuthRouter.post('/login', unroll(login(model)));
  AuthRouter.patch('/', decodeJwt, unroll(update(model)));

  return AuthRouter;
};
