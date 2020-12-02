import { Request, Response } from 'express';

import MonkeyBusinessModel from '../models/monkey-business';

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
  req: Request,
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
};
