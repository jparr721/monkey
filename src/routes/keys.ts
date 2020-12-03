import { celebrate } from 'celebrate';
import { Router } from 'express';

import { get, getOne, create, update, del } from '../controllers/keys';
import unroll from './unroll';
import * as Validators from '../validators/keys';
import KeysModel from '../models/keys';
import logger from '../logger';
import { decodeJwt } from '../lib/tokens/tokens';

export default (): Router => {
  logger.info('Keys - GET,POST,PATCH,DELETE');
  const model = new KeysModel();
  const KeysRouter = Router();

  KeysRouter.get('/', decodeJwt, unroll(get(model)));
  KeysRouter.get(
    '/:id',
    decodeJwt,
    celebrate(Validators.getOneSchema),
    unroll(getOne(model)),
  );

  KeysRouter.post(
    '/',
    decodeJwt,
    celebrate(Validators.createOneSchema),
    unroll(create(model)),
  );

  KeysRouter.patch(
    '/',
    decodeJwt,
    celebrate(Validators.updateOneSchema),
    unroll(update(model)),
  );

  KeysRouter.delete(
    '/:id',
    decodeJwt,
    celebrate(Validators.deleteOneSchema),
    unroll(del(model)),
  );

  return KeysRouter;
};
