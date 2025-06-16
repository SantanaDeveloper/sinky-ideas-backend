import 'reflect-metadata';

describe('Bootstrap Function', () => {
  let mockApp: any;
  let mockReflector: any;
  let mockNestFactory: any;
  let mockSwaggerModule: any;
  let mockDocumentBuilder: any;

  beforeAll(() => {
    // Mock do Reflector
    mockReflector = {};

    // Mock do app NestJS
    mockApp = {
      get: jest.fn().mockReturnValue(mockReflector),
      useGlobalInterceptors: jest.fn(),
      enableCors: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    };

    // Mock do DocumentBuilder
    mockDocumentBuilder = {
      setTitle: jest.fn().mockReturnThis(),
      setDescription: jest.fn().mockReturnThis(),
      setVersion: jest.fn().mockReturnThis(),
      addTag: jest.fn().mockReturnThis(),
      addBearerAuth: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue({}),
    };

    // Mock do NestFactory
    mockNestFactory = {
      create: jest.fn().mockResolvedValue(mockApp)
    };

    // Mock do SwaggerModule
    mockSwaggerModule = {
      createDocument: jest.fn().mockReturnValue({}),
      setup: jest.fn()
    };

    // Aplica os mocks
    jest.doMock('@nestjs/core', () => ({
      NestFactory: mockNestFactory,
      Reflector: jest.fn(),
    }));

    jest.doMock('@nestjs/common', () => ({
      ClassSerializerInterceptor: jest.fn().mockImplementation(() => ({})),
    }));

    jest.doMock('@nestjs/swagger', () => ({
      SwaggerModule: mockSwaggerModule,
      DocumentBuilder: jest.fn().mockImplementation(() => mockDocumentBuilder),
    }));

    // Mock do AppModule
    jest.doMock('./app.module', () => ({
      AppModule: class MockAppModule {}
    }));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment
    process.env.PORT = '3001';
  });

  afterEach(() => {
    delete process.env.PORT;
  });

  it('deve configurar a aplicação corretamente', async () => {
    // Importa o main após os mocks estarem configurados
    const main = await import('./main');
    
    await main.bootstrap();

    // Verifica se o NestFactory foi chamado
    expect(mockNestFactory.create).toHaveBeenCalled();
    
    // Verifica se o interceptor foi configurado
    expect(mockApp.useGlobalInterceptors).toHaveBeenCalled();
    
    // Verifica se o Swagger foi configurado
    expect(mockDocumentBuilder.setTitle).toHaveBeenCalledWith('Mural de Ideias');
    expect(mockDocumentBuilder.setDescription).toHaveBeenCalledWith(
      'API para listar ideias, registrar votos e criar novas ideias'
    );
    expect(mockDocumentBuilder.setVersion).toHaveBeenCalledWith('1.0');
    
    // Verifica as tags
    expect(mockDocumentBuilder.addTag).toHaveBeenCalledWith('ideas');
    expect(mockDocumentBuilder.addTag).toHaveBeenCalledWith('auth');
    expect(mockDocumentBuilder.addTag).toHaveBeenCalledWith('users');
    
    // Verifica a configuração do Bearer Auth
    expect(mockDocumentBuilder.addBearerAuth).toHaveBeenCalledWith(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token'
    );
    
    // Verifica se o documento foi criado
    expect(mockSwaggerModule.createDocument).toHaveBeenCalledWith(mockApp, {});
    
    // Verifica se o Swagger UI foi configurado
    expect(mockSwaggerModule.setup).toHaveBeenCalledWith(
      'api',
      mockApp,
      {},
      expect.objectContaining({
        customSiteTitle: 'Mural de Ideias API Docs',
        explorer: true,
      })
    );
    
    // Verifica se o servidor foi iniciado na porta correta
    expect(mockApp.listen).toHaveBeenCalledWith('3001');
  });

  it('deve usar porta 3001 como padrão', async () => {
    delete process.env.PORT;
    
    const main = await import('./main');
    await main.bootstrap();
    
    expect(mockApp.listen).toHaveBeenCalledWith(3001);
  });

  it('deve configurar as opções customizadas do Swagger corretamente', async () => {
    const main = await import('./main');
    await main.bootstrap();
    
    // Verifica se as opções customizadas foram passadas
    const swaggerSetupCall = mockSwaggerModule.setup.mock.calls[0];
    const swaggerOptions = swaggerSetupCall[3];
    
    expect(swaggerOptions).toEqual(expect.objectContaining({
      customSiteTitle: 'Mural de Ideias API Docs',
      explorer: true,
      swaggerOptions: expect.objectContaining({
        authAction: expect.objectContaining({
          'access-token': expect.objectContaining({
            name: 'Authorization',
            value: 'Bearer ',
          })
        })
      }),
      customCss: expect.stringContaining('.swagger-ui .topbar { background-color: #000; }')
    }));
  });

  it('deve lidar com erros na inicialização', async () => {
    const error = new Error('Falha na inicialização');
    mockApp.listen.mockRejectedValueOnce(error);
    
    const main = await import('./main');
    
    await expect(main.bootstrap()).rejects.toThrow('Falha na inicialização');
  });
});