import { Request, Response } from 'express';

import HttpCodes from '../lib/http/codes';
import KeysModel from '../models/keys';

export const get = (model: KeysModel) => async (
  _: Request,
  res: Response,
): Promise<void> => {
  const data = await model.get();
  res.status(HttpCodes.Ok).json(data);
};

export const getOne = (model: KeysModel) => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const data = await model.getOne(id);
  res.status(HttpCodes.Ok).json(data);
};

export const create = (model: KeysModel) => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { body } = req;
  await model.createOne(body);
  const passwords = await model.get();
  res.render('passwords', { passwords });
};

export const update = (model: KeysModel) => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { body } = req;
  const dto = { ...body, id };
  const data = await model.updateOne(dto);
  res.status(HttpCodes.Ok).json(data);
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const del = (model: KeysModel) => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.body;
  await model.deleteOne({ id } as any);
  const passwords = await model.get();
  res.render('passwords', { passwords });
};
