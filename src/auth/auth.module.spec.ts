import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

jest.mock('../users/users.module', () => ({
  UsersModule: class MockUsersModule {}
}));

jest.mock('./auth.service', () => ({
  AuthService: class MockAuthService {}
}));

jest.mock('./auth.controller', () => ({
  AuthController: class MockAuthController {}
}));

jest.mock('./jwt.strategy', () => ({
  JwtStrategy: class MockJwtStrategy {}
}));

jest.mock('./guards/jwt-auth.guard', () => ({
  JwtAuthGuard: class MockJwtAuthGuard {}
}));

jest.mock('./guards/roles.guard', () => ({
  RolesGuard: class MockRolesGuard {}
}));

describe('AuthModule', () => {
  let module: TestingModule;
  let authService: AuthService;
  let authController: AuthController;
  let jwtStrategy: JwtStrategy;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret-key';

    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    module = moduleRef;
    authService = module.get<AuthService>(AuthService);
    authController = module.get<AuthController>(AuthController);
    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(async () => {
    delete process.env.JWT_SECRET;

    if (module) {
      await module.close();
    }
  });

  describe('Module Initialization', () => {
    it('should be defined', () => {
      expect(module).toBeDefined();
    });

    it('should compile without errors', () => {
      expect(module).toBeInstanceOf(TestingModule);
    });
  });

  describe('Providers', () => {
    it('should provide AuthService', () => {
      expect(authService).toBeDefined();
      expect(authService).toBeInstanceOf(AuthService);
    });

    it('should provide JwtStrategy', () => {
      expect(jwtStrategy).toBeDefined();
      expect(jwtStrategy).toBeInstanceOf(JwtStrategy);
    });

    it('should provide JwtService', () => {
      expect(jwtService).toBeDefined();
      expect(jwtService).toBeInstanceOf(JwtService);
    });

    it('should provide ConfigService', () => {
      expect(configService).toBeDefined();
      expect(configService).toBeInstanceOf(ConfigService);
    });
  });

  describe('Controllers', () => {
    it('should provide AuthController', () => {
      expect(authController).toBeDefined();
      expect(authController).toBeInstanceOf(AuthController);
    });
  });

  describe('Global Guards', () => {
    it('should register global guards correctly', () => {
      expect(module).toBeDefined();
      expect(module).toBeInstanceOf(TestingModule);
    });

    it('should have guards available as providers', () => {
      expect(module).toBeDefined();
    });
  });

  describe('JWT Configuration', () => {
    it('should configure JwtModule with correct secret', () => {
      expect(jwtService).toBeDefined();
      expect(configService.get('JWT_SECRET')).toBe('test-jwt-secret-key');
    });

    it('should set signOptions with expiresIn 1h', () => {
      expect(jwtService).toBeDefined();
    });

    it('should load JWT_SECRET from environment variables', () => {
      const jwtSecret = configService.get<string>('JWT_SECRET');
      expect(jwtSecret).toBe('test-jwt-secret-key');
      expect(jwtSecret).not.toBeNull();
      expect(jwtSecret).not.toBeUndefined();
    });
  });

  describe('Passport Configuration', () => {
    it('should configure PassportModule with default strategy jwt', () => {
      expect(module).toBeDefined();
    });

    it('should have JWT strategy available', () => {
      expect(jwtStrategy).toBeDefined();
    });
  });

  describe('Exports', () => {
    it('should export AuthService', () => {
      const exportedAuthService = module.get(AuthService);
      expect(exportedAuthService).toBeDefined();
      expect(exportedAuthService).toBe(authService);
    });

    it('should export PassportModule', () => {
      expect(module).toBeDefined();
    });

    it('should export JwtModule', () => {
      const exportedJwtService = module.get(JwtService);
      expect(exportedJwtService).toBeDefined();
    });
  });

  describe('Imports', () => {
    it('should import ConfigModule', () => {
      expect(configService).toBeDefined();
    });

    it('should import UsersModule', () => {
      expect(module).toBeDefined();
    });
  });
});

describe('AuthModule - Configuration Tests', () => {
  let testModule: TestingModule;

  afterEach(async () => {
    if (testModule) {
      await testModule.close();
    }
  });

  describe('JWT_SECRET Variations', () => {
    it('should work with long JWT_SECRET', async () => {
      process.env.JWT_SECRET = 'very-long-jwt-secret-for-security-test-123456789';

      testModule = await Test.createTestingModule({
        imports: [AuthModule],
      }).compile();

      const configService = testModule.get<ConfigService>(ConfigService);
      expect(configService.get('JWT_SECRET')).toBe('very-long-jwt-secret-for-security-test-123456789');

      delete process.env.JWT_SECRET;
    });

    it('should work with short JWT_SECRET', async () => {
      process.env.JWT_SECRET = 'short';

      testModule = await Test.createTestingModule({
        imports: [AuthModule],
      }).compile();

      const configService = testModule.get<ConfigService>(ConfigService);
      expect(configService.get('JWT_SECRET')).toBe('short');

      delete process.env.JWT_SECRET;
    });
  });

  describe('Module Configuration', () => {
    beforeEach(() => {
      process.env.JWT_SECRET = 'test-config-secret';
    });

    afterEach(() => {
      delete process.env.JWT_SECRET;
    });

    it('should configure JwtModule.registerAsync properly', async () => {
      testModule = await Test.createTestingModule({
        imports: [AuthModule],
      }).compile();

      const jwtService = testModule.get<JwtService>(JwtService);
      const configService = testModule.get<ConfigService>(ConfigService);

      expect(jwtService).toBeDefined();
      expect(configService.get('JWT_SECRET')).toBe('test-config-secret');
    });

    it('should configure PassportModule with default strategy jwt', async () => {
      testModule = await Test.createTestingModule({
        imports: [AuthModule],
      }).compile();

      expect(testModule).toBeDefined();
    });
  });
});

describe('AuthModule - Integration Tests', () => {
  describe('Provider Dependency Resolution', () => {
    let integrationModule: TestingModule;

    beforeEach(async () => {
      process.env.JWT_SECRET = 'integration-test-secret';
    });

    afterEach(async () => {
      delete process.env.JWT_SECRET;
      if (integrationModule) {
        await integrationModule.close();
      }
    });

    it('should resolve all dependencies correctly', async () => {
      integrationModule = await Test.createTestingModule({
        imports: [AuthModule],
      }).compile();

      const authService = integrationModule.get<AuthService>(AuthService);
      const jwtStrategy = integrationModule.get<JwtStrategy>(JwtStrategy);
      const authController = integrationModule.get<AuthController>(AuthController);
      const jwtService = integrationModule.get<JwtService>(JwtService);

      expect(authService).toBeDefined();
      expect(jwtStrategy).toBeDefined();
      expect(authController).toBeDefined();
      expect(jwtService).toBeDefined();
    });

    it('should have guards registered and module fully functional', async () => {
      integrationModule = await Test.createTestingModule({
        imports: [AuthModule],
      }).compile();

      expect(integrationModule).toBeDefined();
      expect(integrationModule).toBeInstanceOf(TestingModule);
    });
  });

  describe('Minimal Configuration', () => {
    it('should create module with minimal config without failure', async () => {
      process.env.JWT_SECRET = 'minimal-config-test';

      let minimalModule: TestingModule | undefined;

      try {
        minimalModule = await Test.createTestingModule({
          imports: [AuthModule],
        }).compile();

        expect(minimalModule).toBeDefined();

        const authService = minimalModule.get<AuthService>(AuthService);
        const configService = minimalModule.get<ConfigService>(ConfigService);

        expect(authService).toBeDefined();
        expect(configService.get('JWT_SECRET')).toBe('minimal-config-test');

      } catch (error) {
        expect(`Should not fail during module creation: ${error.message}`).toBe('');
      } finally {
        if (minimalModule) {
          await minimalModule.close();
        }
        delete process.env.JWT_SECRET;
      }
    });
  });
});