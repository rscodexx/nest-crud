import {
    BadRequestException,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { AuthRegisterDto } from './dto/auth.register.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
@Injectable()
export class AuthService {
    private issuer = 'login';
    private audience = 'users';

    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
        private readonly mailer: MailerService
    ) {}

    async createToken(user: User) {
        return {
            accessToken: this.jwtService.sign(
                {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                {
                    expiresIn: '30m',
                    subject: String(user.id),
                    issuer: this.issuer,
                    audience: this.audience
                }
            )
        };
    }
    checkToken(token: string) {
        try {
            return this.jwtService.verify(token, {
                issuer: this.issuer,
                audience: this.audience
            });
        } catch (err) {
            throw new BadRequestException(err);
        }
    }
    isValidToken(token: string) {
        try {
            this.checkToken(token);
            return true;
        } catch (err) {
            return false;
        }
    }

    async login(email: string, password: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                email
            }
        });

        if (!user) {
            throw new UnauthorizedException('E-mail e/ou senha inválidos.');
        }

        if (!(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('E-mail e/ou senha inválidos.');
        }

        return this.createToken(user);
    }
    async forget(email: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                email
            }
        });

        if (!user) {
            throw new UnauthorizedException('E-mail está incorreto.');
        }

        const token = this.jwtService.sign(
            {
                id: user.id
            },
            {
                expiresIn: '30m',
                subject: String(user.id),
                issuer: 'forget',
                audience: 'users'
            }
        );

        await this.mailer.sendMail({
            subject: 'Recuperação de Senha',
            to: 'a@a.com',
            template: 'forget',
            context: {
                name: user.name,
                token
            }
        });

        return true;
    }
    async reset(password: string, token: string) {
        try {
            const { id } = this.jwtService.verify(token, {
                issuer: 'forget',
                audience: 'users'
            });

            password = await bcrypt.hash(password, await bcrypt.genSalt());

            const user = await this.prisma.user.update({
                where: {
                    id
                },
                data: {
                    password
                }
            });

            return this.createToken(user);
        } catch (err) {
            throw new UnauthorizedException(err);
        }
    }

    async register(data: AuthRegisterDto) {
        const user = await this.userService.create(data);

        return this.createToken(user);
    }
}
