import { Request, Response } from 'express';

import KeysModel from '../models/keys';

// TODO(@jparr721) - Auto-login if valid token
export const login = async (_req: Request, res: Response): Promise<void> => {
  res.render('login');
};

export const passwords = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  const keysModel = new KeysModel();
  const passwords = await keysModel.get();
  res.render('passwords', { passwords });
};
