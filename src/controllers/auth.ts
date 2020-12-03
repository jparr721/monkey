import { Request, Response } from 'express';

import KeysModel from '../models/keys';
import MonkeyBusinessModel from '../models/monkey-business';
import { JwtRequest } from '../lib/tokens/tokens';

export const create = (model: MonkeyBusinessModel) => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { body } = req;
  const token = await model.createOne(body.password);
  res
    .cookie('token', token, { expires: new Date(Date.now() + 600000) })
    .render('passwords');
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

  const keysModel = new KeysModel();
  const passwords = await keysModel.get();

  res
    .cookie('token', token, { expires: new Date(Date.now() + 600000) })
    .render('passwords', { passwords });
};
