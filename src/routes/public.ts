import { Router } from 'express';

import { get } from '../controllers/public';
import unroll from './unroll';

export default (): Router => {
  const PublicRouter = Router();

  PublicRouter.get('/', unroll(get));

  return PublicRouter;
};
