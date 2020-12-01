import { celebrate } from 'celebrate';
import { Router } from 'express';
import { getConnection } from 'typeorm';

import { get, getOne, create, update, del } from '../controllers/keys';
import unroll from './unroll';
import * as Validators from '../validators/keys';
import KeysModel from '../models/keys';
import logger from '../logger';
import { Keys } from '../models/entities/keys';

export default (): Router => {
  logger.info('Keys - GET,POST,PATCH,DELETE');
  const model = new KeysModel(getConnection().getRepository(Keys));
  const KeysRouter = Router();

  KeysRouter.get('/', unroll(get(model)));
  KeysRouter.get(
    '/:id',
    celebrate(Validators.getOneSchema),
    unroll(getOne(model)),
  );

  KeysRouter.post(
    '/',
    celebrate(Validators.createOneSchema),
    unroll(create(model)),
  );

  KeysRouter.patch(
    '/',
    celebrate(Validators.updateOneSchema),
    unroll(update(model)),
  );

  KeysRouter.delete(
    '/:id',
    celebrate(Validators.deleteOneSchema),
    unroll(del(model)),
  );

  return KeysRouter;
};
