import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppModule } from '../src/app.module';
import { User } from '../src/users/entities/user.entity';
import { Idea } from '../src/ideas/entities/idea.entity';
import { Vote } from '../src/ideas/entities/vote.entity';

describe('App (e2e)', () => {
  let app: INestApplication;
  let jwtUser1: string;
  let jwtUser2: string;
  let ideaId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User, Idea, Vote],
          synchronize: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1) POST /auth/signup → criar usuário "user1"', () =>
    request(app.getHttpServer())
      .post('/auth/signup')
      .send({ username: 'user1', password: 'password123' })
      .expect(201));

  it('2) POST /auth/login → autenticar user1', () =>
    request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'user1', password: 'password123' })
      .expect(200)
      .expect(res => {
        jwtUser1 = res.body.access_token;
      }));

  it('3) POST /auth/signup → criar usuário "user2"', () =>
    request(app.getHttpServer())
      .post('/auth/signup')
      .send({ username: 'user2', password: 'password456' })
      .expect(201));

  it('4) POST /auth/login → autenticar user2', () =>
    request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'user2', password: 'password456' })
      .expect(200)
      .expect(res => {
        jwtUser2 = res.body.access_token;
      }));

  it('5) POST /ideas → cria nova ideia como user1', () =>
    request(app.getHttpServer())
      .post('/ideas')
      .set('Authorization', `Bearer ${jwtUser1}`)
      .send({ title: 'Minha primeira ideia' })
      .expect(201)
      .expect(res => {
        ideaId = res.body.id;
      }));

  it('6) POST /ideas/:id/vote → user1 registra voto', () =>
    request(app.getHttpServer())
      .post(`/ideas/${ideaId}/vote`)
      .set('Authorization', `Bearer ${jwtUser1}`)
      .expect(200));

  it('7) DELETE /ideas/:id com user2 → 403 Forbidden', () =>
    request(app.getHttpServer())
      .delete(`/ideas/${ideaId}`)
      .set('Authorization', `Bearer ${jwtUser2}`)
      .expect(403));

  it('8) PATCH /ideas/:id com user2 → 403 Forbidden', () =>
    request(app.getHttpServer())
      .patch(`/ideas/${ideaId}`)
      .set('Authorization', `Bearer ${jwtUser2}`)
      .send({ newTitle: 'Tentativa indevida' })
      .expect(403));
});
