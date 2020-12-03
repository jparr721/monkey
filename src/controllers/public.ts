import { Request, Response } from 'express';

export const login = async (_: Request, res: Response): Promise<void> => {
  res.render('login');
};
