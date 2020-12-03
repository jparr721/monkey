import { Joi, Segments } from 'celebrate';

export const getOneSchema = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
};

export const createOneSchema = {
  [Segments.BODY]: Joi.object().keys({
    username: Joi.string().required(),
    key: Joi.string().required(),
    provider: Joi.string().required(),
  }),
};

export const updateOneSchema = {
  ...getOneSchema,
  ...createOneSchema,
};

export const deleteOneSchema = {
  ...getOneSchema,
};
