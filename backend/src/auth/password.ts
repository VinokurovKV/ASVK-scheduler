import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const SCRYPT_COST = 16384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 1;
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_MAX_MEMORY = 32 * 1024 * 1024;

const deriveKey = (password: string, salt: Buffer) =>
  new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password,
      salt,
      SCRYPT_KEY_LENGTH,
      {
        N: SCRYPT_COST,
        r: SCRYPT_BLOCK_SIZE,
        p: SCRYPT_PARALLELIZATION,
        maxmem: SCRYPT_MAX_MEMORY,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      },
    );
  });

export const hashPassword = async (password: string) => {
  const salt = randomBytes(16);
  const derivedKey = await deriveKey(password, salt);

  return [
    'scrypt',
    SCRYPT_COST,
    SCRYPT_BLOCK_SIZE,
    SCRYPT_PARALLELIZATION,
    salt.toString('base64url'),
    derivedKey.toString('base64url'),
  ].join('$');
};

export const verifyPassword = async (password: string, encodedHash: string) => {
  const [algorithm, cost, blockSize, parallelization, salt, storedKey] =
    encodedHash.split('$');

  if (
    algorithm !== 'scrypt' ||
    Number(cost) !== SCRYPT_COST ||
    Number(blockSize) !== SCRYPT_BLOCK_SIZE ||
    Number(parallelization) !== SCRYPT_PARALLELIZATION ||
    !salt ||
    !storedKey
  ) {
    return false;
  }

  const expectedKey = Buffer.from(storedKey, 'base64url');
  const actualKey = await deriveKey(password, Buffer.from(salt, 'base64url'));

  return (
    expectedKey.length === actualKey.length &&
    timingSafeEqual(expectedKey, actualKey)
  );
};
