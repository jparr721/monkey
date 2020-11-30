import { Joi, Segments } from 'celebrate';

export const getOneSchema = {
  [Segments.PARAMS]: Joi.object().keys({
    id: Joi.string().uuid().required(),
  }),
};

export const createOneSchema = {
  [Segments.BODY]: Joi.object().keys({
    key: Joi.string().length(1).required(),
  }),
};

export const updateOneSchema = {
  ...getOneSchema,
  ...createOneSchema,
};

export const deleteOneSchema = {
  ...getOneSchema,
};
