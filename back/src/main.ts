import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import config from './utils/config';
import chalk from 'chalk';
import middleware from './utils/middleware';

async function bootstrap() {
    await config.load();

    if (process.env.NODE_ENV === 'development') {
        console.log(chalk.italic.cyan('\nDev mode\n'));
        console.log('Current config:', config.json);
    }

    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
        }),
    );
    app.setGlobalPrefix('api');

    if (process.env.NODE_ENV === 'development') {
        app.enableCors({
            origin: true,
            credentials: true,
        });
    } else {
        app.use(
            helmet({
                contentSecurityPolicy: false,
            }),
        );
    }

    app.use(middleware);

    await app.listen(3001);
}
bootstrap();
