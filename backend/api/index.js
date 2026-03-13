// Vercel serverless function entry point
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { ValidationPipe } = require('@nestjs/common');

let app;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    // Enable CORS
    const corsOrigins = process.env.CORS_ORIGINS || '*';
    app.enableCors({
      origin: corsOrigins.split(','),
      credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

    // Validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  }
  return app;
}

module.exports = async (req, res) => {
  const server = await bootstrap();
  const expressApp = server.getHttpAdapter().getInstance();
  return expressApp(req, res);
};
