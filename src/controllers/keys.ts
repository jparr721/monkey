import { Request, Response } from 'express';

import KeysModel from '../models/keys';

export const get = (model: KeysModel) => async (
  _: Request,
  res: Response,
): Promise<void> => {
  const data = await model.get();
  res.status(200).json(data);
};

export const getOne = (model: KeysModel) => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const data = await model.getOne(id);
  res.status(200).json(data);
};

export const create = (model: KeysModel) => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { body } = req;
  const data = await model.createOne(body);
  res.status(200).json(data);
};

export const update = (model: KeysModel) => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const { body } = req;
  const dto = { ...body, id };
  const data = await model.updateOne(dto);
  res.status(200).json(data);
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export const del = (model: KeysModel) => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const data = await model.deleteOne({ id } as any);
  res.status(200).json(data);
};
