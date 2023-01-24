import { forwardRef, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

@Module({
    imports: [
        ConfigModule.forRoot(),
        ThrottlerModule.forRoot({
            ttl: 60,
            limit: 10,
            ignoreUserAgents: [/googlebot/gi]
        }),
        forwardRef(() => UserModule),
        forwardRef(() => AuthModule),
        MailerModule.forRoot({
            transport: {
                host: 'smtp.mailtrap.io',
                port: 2525,
                auth: {
                    user: 'a87892caa05694',
                    pass: 'cf6e6d00d47dd0'
                }
            },
            defaults: {
                from: '"NestJS" <modules@nestjs.com>'
            },
            template: {
                dir: __dirname + '/templates',
                adapter: new PugAdapter(),
                options: {
                    strict: true
                }
            }
        })
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard
        }
    ],
    exports: [AppService]
})
export class AppModule {}
