import Joi from 'joi';

export const bulkUploadSchema = Joi.object({
  format: Joi.string().valid('csv', 'json').required(),
});
