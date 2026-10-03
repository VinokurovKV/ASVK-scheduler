import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const SCRYPT_COST = 16384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLELIZATION = 5;
const SCRYPT_KEY_LENGTH = 64;
const SCRYPT_MAX_MEMORY = 32 * 1024 * 1024;

interface ScryptParameters {
  cost: number;
  blockSize: number;
  parallelization: number;
}

const currentParameters: ScryptParameters = {
  cost: SCRYPT_COST,
  blockSize: SCRYPT_BLOCK_SIZE,
  parallelization: SCRYPT_PARALLELIZATION,
};

const isSupportedParameters = (parameters: ScryptParameters) => {
  const isCurrent =
    parameters.cost === SCRYPT_COST &&
    parameters.blockSize === SCRYPT_BLOCK_SIZE &&
    parameters.parallelization === SCRYPT_PARALLELIZATION;

  const isLegacy =
    parameters.cost === 16384 &&
    parameters.blockSize === 8 &&
    parameters.parallelization === 1;

  return isCurrent || isLegacy;
};

const deriveKey = (
  password: string,
  salt: Buffer,
  parameters: ScryptParameters,
) =>
  new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password,
      salt,
      SCRYPT_KEY_LENGTH,
      {
        N: parameters.cost,
        r: parameters.blockSize,
        p: parameters.parallelization,
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
  const derivedKey = await deriveKey(password, salt, currentParameters);

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

  const parameters = {
    cost: Number(cost),
    blockSize: Number(blockSize),
    parallelization: Number(parallelization),
  };

  if (
    algorithm !== 'scrypt' ||
    !isSupportedParameters(parameters) ||
    !salt ||
    !storedKey
  ) {
    return false;
  }

  const expectedKey = Buffer.from(storedKey, 'base64url');
  const actualKey = await deriveKey(
    password,
    Buffer.from(salt, 'base64url'),
    parameters,
  );

  return (
    expectedKey.length === actualKey.length &&
    timingSafeEqual(expectedKey, actualKey)
  );
};

export const passwordNeedsRehash = (encodedHash: string) => {
  const [algorithm, cost, blockSize, parallelization] = encodedHash.split('$');

  return (
    algorithm !== 'scrypt' ||
    Number(cost) !== SCRYPT_COST ||
    Number(blockSize) !== SCRYPT_BLOCK_SIZE ||
    Number(parallelization) !== SCRYPT_PARALLELIZATION
  );
};
