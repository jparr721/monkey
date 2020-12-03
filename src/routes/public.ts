import { Router } from 'express';

import { login } from '../controllers/public';
import unroll from './unroll';

export default (): Router => {
  const PublicRouter = Router();

  PublicRouter.get('/', unroll(login));

  return PublicRouter;
};
