import { Router } from 'express';

import { passwordsPage } from '../controllers/public';
import unroll from './unroll';

export default (): Router => {
  const PublicRouter = Router();

  PublicRouter.get('/', unroll(passwordsPage));

  return PublicRouter;
};
