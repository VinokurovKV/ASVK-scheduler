import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';

describe('Protected API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await app.listen(0, '127.0.0.1');
  });

  it('rejects an unauthenticated events request', () => {
    return request(app.getHttpServer()).get('/events').expect(401);
  });

  it('limits repeated login attempts', async () => {
    const loginRequest = () =>
      request(app.getHttpServer()).post('/auth/login').send({
        login: 'missing-user',
        password: 'incorrect-password',
      });

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await loginRequest().expect(401);
    }

    await loginRequest().expect(429);
  });

  afterEach(async () => {
    await app.close();
  });
});
