import { Router } from 'express';

import unroll from './unroll';
import { decodeJwt } from '../lib/tokens/tokens';
import { login, passwords } from '../controllers/public';

export default (): Router => {
  const PublicRouter = Router();

  PublicRouter.get('/', unroll(login));
  PublicRouter.get('/passwords', decodeJwt, unroll(passwords));

  return PublicRouter;
};
