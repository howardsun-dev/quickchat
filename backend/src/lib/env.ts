import 'dotenv/config';

function requiredEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environmental variable: ${key}`);
  }
  return value;
}

export const ENV = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: requiredEnv('JWT_SECRET'),
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_URL: process.env.CLIENT_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
  CLOUDINARY_CLOUD_NAME: requiredEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: requiredEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: requiredEnv('CLOUDINARY_API_SECRET'),
  ARCJET_KEY: requiredEnv('ARCJET_KEY'),
  ARCJET_ENV: requiredEnv('ARCJET_ENV'),
};
