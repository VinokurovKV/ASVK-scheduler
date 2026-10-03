import { scrypt } from 'node:crypto';
import {
  hashPassword,
  passwordNeedsRehash,
  verifyPassword,
} from './password.js';

const createLegacyHash = (password: string) =>
  new Promise<string>((resolve, reject) => {
    const salt = Buffer.from('legacy-test-salt');

    scrypt(
      password,
      salt,
      64,
      {
        N: 16384,
        r: 8,
        p: 1,
        maxmem: 32 * 1024 * 1024,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(
          [
            'scrypt',
            16384,
            8,
            1,
            salt.toString('base64url'),
            derivedKey.toString('base64url'),
          ].join('$'),
        );
      },
    );
  });

describe('password hashing', () => {
  it('stores a salted hash instead of the password', async () => {
    const password = 'correct horse battery staple';
    const hash = await hashPassword(password);

    expect(hash).not.toContain(password);
    expect(hash.startsWith('scrypt$')).toBe(true);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('valid password');

    await expect(verifyPassword('invalid password', hash)).resolves.toBe(false);
  });

  it('uses a different salt for every password', async () => {
    const firstHash = await hashPassword('same password');
    const secondHash = await hashPassword('same password');

    expect(firstHash).not.toBe(secondHash);
  });

  it('accepts a legacy hash and marks it for rehashing', async () => {
    const password = 'legacy password';
    const legacyHash = await createLegacyHash(password);

    await expect(verifyPassword(password, legacyHash)).resolves.toBe(true);
    expect(passwordNeedsRehash(legacyHash)).toBe(true);
  });

  it('creates hashes with the current parameters', async () => {
    const hash = await hashPassword('current password');

    expect(hash.startsWith('scrypt$16384$8$5$')).toBe(true);
    expect(passwordNeedsRehash(hash)).toBe(false);
  });
});
