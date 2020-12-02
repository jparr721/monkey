import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

import HttpCodes from '../http/codes';
import { dotenvValue, DotenvVariable } from '../../dotenv';
import logger from '../../logger';

export interface Jwt {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
}

export interface JwtRequest extends Request {
  jwt: string | Jwt;
}

export function encodeJwt(): string {
  // TTL is only 10 minutes to avoid key theft related issues
  const exp = new Date(Date.now() + 600000);

  const privateKeyEncoded = dotenvValue(DotenvVariable.JwtPrivateKey, '');
  if (!privateKeyEncoded) {
    logger.error('No jwt key configured.');
    throw new Error('No jwt key configured.');
  }

  const privateKey = Buffer.from(privateKeyEncoded, 'base64').toString();

  const params = {
    exp,
    aud: 'monkey',
    iat: Math.floor(new Date().getTime() / 1000),
    iss: 'monkey-gang',
  };

  return jwt.sign(params, privateKey, { algorithm: 'ES256' });
}

export function verifyJwt(token: string, secret: string): Jwt | undefined {
  try {
    const valid = jwt.verify(token, secret);

    if (typeof valid === 'string') {
      return JSON.parse(valid);
    }

    // Sufficient type overlap lets us cast from 'object' to Jwt.
    return valid as Jwt;
  } catch (e) {
    logger.error(e.message);
    return undefined;
  }
}

export async function decodeJwt(
  req: JwtRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const publicKeyEncoded = dotenvValue(DotenvVariable.JwtPublicKey, '');

  if (isEmpty(publicKeyEncoded)) {
    res.status(HttpCodes.InternalServerError).json({
      message: 'Internal Server Error',
    });
    return;
  }

  const publicKey = Buffer.from(publicKeyEncoded, 'base64').toString();
  const token = req.cookies;

  if (!token || isEmpty(token)) {
    res.status(HttpCodes.Forbidden).json({
      message: 'origin authentication failed; no authentication header found',
      context: { token },
    });
    return;
  }

  const jwt = verifyJwt(token, publicKey);

  if (isUndefined(jwt)) {
    res.status(HttpCodes.Forbidden).json({
      message: 'origin authentication failed; invalid session token',
      context: { token },
    });
    return;
  }

  req.jwt = jwt;

  next();
}
