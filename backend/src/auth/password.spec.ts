import { hashPassword, verifyPassword } from './password.js';

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
});
