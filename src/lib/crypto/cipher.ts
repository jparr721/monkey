import crypto from 'crypto';

import { dotenvValue, DotenvVariable } from '../../dotenv';

export interface Hashed {
  iv: string;
  content: string;
}

const algorithm = 'aes-256-ctr';
const cryptSigningKey = dotenvValue(DotenvVariable.CryptSigningKey, '');
const cryptInitializationVector = dotenvValue(
  DotenvVariable.CryptInitializationVector,
  '',
);

function initializationVectorIsHex(iv: string): boolean {
  const regexp = /^[0-9a-fA-F]+$/;
  return regexp.test(iv);
}

export function encryptString(password: string): string {
  if (!initializationVectorIsHex(cryptInitializationVector)) {
    throw new Error('Invalid initialization vector argument');
  }

  if (!cryptSigningKey) {
    throw new Error('Undefined crypt signing key.');
  }

  // Convert from hex to buffer to sign the cipher string
  const signingIv = Buffer.from(cryptInitializationVector, 'hex');

  const cipher = crypto.createCipheriv(algorithm, cryptSigningKey, signingIv);

  const encrypted = Buffer.concat([cipher.update(password), cipher.final()]);

  return JSON.stringify({
    // Use the regular hex value for readability
    iv: cryptInitializationVector,
    content: encrypted.toString('hex'),
  });
}

export function decryptString(hash: Hashed): string {
  const decipher = crypto.createDecipheriv(
    algorithm,
    cryptSigningKey,
    Buffer.from(hash.iv, 'hex'),
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, 'hex')),
    decipher.final(),
  ]);

  return decrpyted.toString();
}
