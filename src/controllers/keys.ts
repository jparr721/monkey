import { Request, Response } from 'express';

import ModelController from '../models/controller';

export const get = <T>(model: ModelController<T>) => async (
  _: Request,
  res: Response,
): Promise<void> => {
  const data = await model.get();
  res.status(200).json(data);
};

export const getOne = <T>(model: ModelController<T>) => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const data = await model.getOne(id);
  res.status(200).json(data);
};

export const create = <T>(model: ModelController<T>) => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { body } = req;
  const data = await model.createOne(body);
  res.status(200).json(data);
};

export const update = <T>(model: ModelController<T>) => async (
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
export const del = <T>(model: ModelController<T>) => async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const data = await model.deleteOne({ id } as any);
  res.status(200).json(data);
};
