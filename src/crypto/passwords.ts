import bcrypt from 'bcrypt';

import { dotenvValue, DotenvVariable } from '../dotenv';

export async function hashPassword(password: string): Promise<string> {
  const BcryptSaltRounds = Number(
    dotenvValue(DotenvVariable.BcryptSaltRounds, '10'),
  );

  return bcrypt.hash(password, BcryptSaltRounds);
}

export async function checkPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
