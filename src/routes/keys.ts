import { celebrate } from 'celebrate';
import { Router } from 'express';

import { get, getOne, create, update, del } from '../controllers/keys';
import unroll from './unroll';
import * as Validators from '../validators/keys';
import KeysModel from '../models/keys';
import logger from '../logger';

export default (): Router => {
  logger.info('Keys - GET,POST,PATCH,DELETE');
  const model = new KeysModel();
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

  KeysRouter.post('/delete', unroll(del(model)));

  return KeysRouter;
};
