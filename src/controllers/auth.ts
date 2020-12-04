import { Request, Response } from 'express';

import KeysModel from '../models/keys';
import MonkeyBusinessModel from '../models/monkey-business';
import { JwtRequest } from '../lib/tokens/tokens';
import { Keys } from '../models/entities/keys';

async function getCurrentPasswordList(): Promise<Keys[]> {
  const keysModel = new KeysModel();
  return keysModel.get();
}

export const create = (model: MonkeyBusinessModel) => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { body } = req;
  const token = await model.createOne(body.password);
  const passwords = await getCurrentPasswordList();
  res
    .cookie('token', token, { expires: new Date(Date.now() + 600000) })
    .render('passwords', { passwords });
};

export const update = (model: MonkeyBusinessModel) => async (
  req: JwtRequest,
  res: Response,
): Promise<void> => {
  const { body } = req;
  const token = await model.updateOne(body.password, body.newPassword);
  res
    .cookie('token', token, { expires: new Date(Date.now() + 600000) })
    .redirect('back');
};

export const login = (model: MonkeyBusinessModel) => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { body } = req;
  const token = await model.login(body.password);

  if (!token) {
    res.render('login', {
      message: 'invalid password',
    });
  }
  const passwords = await getCurrentPasswordList();
  res
    .cookie('token', token, { expires: new Date(Date.now() + 600000) })
    .render('passwords', { passwords });
};
