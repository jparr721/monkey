import { Request, Response } from 'express';

export const passwordsPage = async (
  _: Request,
  res: Response,
): Promise<void> => {
  res.render('index', {
    name: 'Passwords',
    passwords: [
      {
        id: 1,
        username: 'barbaz',
        password: 'foobar',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  });
};
