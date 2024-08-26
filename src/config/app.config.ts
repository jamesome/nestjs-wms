import Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid(
    'development',
    'production',
    'local',
    'test',
    'staging',
  ),
  // DB_HOST: Joi.string().required(),
  // DB_PORT: Joi.number().required(),
  // DB_USERNAME: Joi.string().required(),
  // DB_PASSWORD: Joi.string().required(),
  // DB_NAME: Joi.string().required(),
  FALLBACK_LANGUAGE: Joi.string().required(),
  THROTTLE_TTL: Joi.number().required(),
  THROTTLE_LIMIT: Joi.number().required(),
  // REDIS_HOST: Joi.string().required(),
  // REDIS_PORT: Joi.number().required(),
});
