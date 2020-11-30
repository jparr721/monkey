import { getConnection } from 'typeorm';

import { Keys } from './entities/keys';
import ModelController from './controller';

const KeysModel = (): ModelController<Keys> =>
  new ModelController<Keys>(getConnection().getRepository(Keys));

export default KeysModel;
