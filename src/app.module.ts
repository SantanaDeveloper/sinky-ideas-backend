import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { IdeasModule } from './ideas/ideas.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SeedService } from './seed/seed.service';
const Joi = require('joi');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'test',
      validationSchema: Joi.object({
        DATABASE_TYPE: Joi.string()
          .valid('sqlite', 'postgres')
          .default('sqlite')
          .description('Tipo de banco de dados: sqlite ou postgres'),
        DATABASE_NAME: Joi.string()
          .default('db.sqlite')
          .description('Nome (ou path) do arquivo de DB para sqlite, ou database name para postgres'),
        DB_SYNC: Joi.boolean()
          .truthy('true')
          .falsy('false')
          .default(true)
          .description('Se o TypeORM deve sincronizar o schema (true/false)'),
        LOGGING: Joi.boolean()
          .truthy('true')
          .falsy('false')
          .default(false)
          .description('Habilita logs do TypeORM (true/false)'),
        JWT_SECRET: Joi.string()
          .default('USARCHAVEFORTEEMPRODUCAO')
          .description('Chave secreta para assinar os tokens JWT'),
      }),
      validationOptions: {
        abortEarly: true,
      },
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
        type: config.get<'sqlite' | 'postgres'>('DATABASE_TYPE')!,
        database: config.get<string>('DATABASE_NAME')!,
        synchronize: config.get<boolean>('DB_SYNC')!,
        logging: config.get<boolean>('LOGGING')!,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
      }),
    }),
    IdeasModule,
    UsersModule,
    AuthModule,
  ],
  providers: [SeedService],
})
export class AppModule { }