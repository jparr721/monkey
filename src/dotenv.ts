import dotenv from 'dotenv';

dotenv.config();

export enum DotenvVariable {
  NodePort = 'NODE_PORT',
  NodeEnv = 'NODE_ENV',
  DbUser = 'DB_USER',
  DbPassword = 'DB_PASSWORD',
  DbPort = 'DB_PORT',
  DbHost = 'DB_HOST',
  BcryptSaltRounds = 'BCRYPT_SALT_ROUNDS',
  LogLevel = 'LOG_LEVEL',
  CryptSigningKey = 'CRYPT_SIGNING_KEY',
  CryptInitializationVector = 'CRYPT_INITIALIZATION_VECTOR',
  JwtPublicKey = 'JWT_PUBLIC_KEY',
  JwtPrivateKey = 'JWT_PRIVATE_KEY',
}

export function dotenvValue(name: DotenvVariable, default_: string): string {
  const value = process.env[name];
  return value ? value : default_;
}
