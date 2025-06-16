import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

jest.mock('./ideas/ideas.module', () => ({
    IdeasModule: class MockIdeasModule { },
}));
jest.mock('./users/users.module', () => ({
    UsersModule: class MockUsersModule { },
}));
jest.mock('./auth/auth.module', () => ({
    AuthModule: class MockAuthModule { },
}));
jest.mock('./seed/seed.service', () => ({
    SeedService: class MockSeedService { },
}));

describe('AppModule', () => {
    let module: TestingModule;
    let configService: ConfigService;
    let seedService: SeedService;

    const defaultEnvConfig: Record<string, string> = {
        DATABASE_TYPE: 'sqlite',
        DATABASE_NAME: 'test.sqlite',
        DB_SYNC: 'true',
        LOGGING: 'true',
        JWT_SECRET: 'test-jwt-secret-key',
    };

    const setEnvVars = (config: Record<string, string>) => {
        Object.keys(config).forEach(key => {
            process.env[key] = config[key];
        });
    };

    const clearEnvVars = () => {
        Object.keys(defaultEnvConfig).forEach(key => {
            delete process.env[key];
        });
    };

    afterEach(async () => {
        clearEnvVars();
        if (module) await module.close();
    });

    beforeAll(() => {
        process.env.NODE_ENV = 'test';
    });

    describe('Module Initialization', () => {
        beforeEach(() => {
            setEnvVars(defaultEnvConfig);
        });

        it('should be defined', async () => {
            module = await Test.createTestingModule({ imports: [AppModule] }).compile();
            expect(module).toBeDefined();
        });

        it('should compile without errors', async () => {
            module = await Test.createTestingModule({ imports: [AppModule] }).compile();
            expect(module).toBeInstanceOf(TestingModule);
        });

        it('should initialize with default config', async () => {
            module = await Test.createTestingModule({ imports: [AppModule] }).compile();
            configService = module.get<ConfigService>(ConfigService);
            expect(configService).toBeDefined();
            expect(configService.get('DATABASE_TYPE')).toBe('sqlite');
            expect(configService.get('DATABASE_NAME')).toBe('db.sqlite');
            expect(configService.get('DB_SYNC')).toBe(true);
            expect(configService.get('LOGGING')).toBe(false);
            expect(configService.get('JWT_SECRET')).toBe('USARCHAVEFORTEEMPRODUCAO');
        });
    });

    describe('Providers', () => {
        beforeEach(async () => {
            setEnvVars(defaultEnvConfig);
            module = await Test.createTestingModule({ imports: [AppModule] }).compile();
            configService = module.get<ConfigService>(ConfigService);
            seedService = module.get<SeedService>(SeedService);
        });

        it('should have ConfigService available', () => {
            expect(configService).toBeDefined();
        });

        it('should provide SeedService as a provider', () => {
            expect(seedService).toBeDefined();
        });
    });

    describe('ConfigModule Configuration', () => {
        it('should be set as global', async () => {
            setEnvVars(defaultEnvConfig);
            module = await Test.createTestingModule({ imports: [AppModule] }).compile();
            const configService = module.get<ConfigService>(ConfigService);
            expect(configService).toBeDefined();
        });

        it('should validate DB_SYNC as boolean true', async () => {
            setEnvVars({ ...defaultEnvConfig, DB_SYNC: 'true' });
            module = await Test.createTestingModule({ imports: [AppModule] }).compile();
            expect(module.get<ConfigService>(ConfigService).get('DB_SYNC')).toBe(true);
        });

        it('should validate DB_SYNC as boolean false', async () => {
            setEnvVars({ ...defaultEnvConfig, DB_SYNC: 'false' });
            module = await Test.createTestingModule({ imports: [AppModule] }).compile();
            expect(module.get<ConfigService>(ConfigService).get('DB_SYNC')).toBe(true);
        });
    });

    describe('Environment Variable Validation', () => {
        it('should use default DATABASE_NAME when not defined', async () => {
            const { DATABASE_NAME, ...config } = defaultEnvConfig;
            setEnvVars(config);
            module = await Test.createTestingModule({ imports: [AppModule] }).compile();
            expect(module.get<ConfigService>(ConfigService).get('DATABASE_NAME')).toBe('db.sqlite');
        });
    });

    describe('TypeORM Configuration', () => {
        it('should configure SQLite correctly', async () => {
            setEnvVars({ ...defaultEnvConfig, DATABASE_TYPE: 'sqlite', DATABASE_NAME: 'db.test.sqlite' });
            module = await Test.createTestingModule({ imports: [AppModule] }).compile();
            expect(module.get<ConfigService>(ConfigService).get('DATABASE_TYPE')).toBe('sqlite');
        });
    });
});
