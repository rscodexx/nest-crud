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
@Injectable()
export class AuthService {
    private issuer = 'login';
    private audience = 'users';

    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly userService: UserService
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

        // Enviable e-mail.

        return true;
    }
    async reset(password: string, token: string) {
        // Valida o token.

        const id = 0;

        const user = await this.prisma.user.update({
            where: {
                id
            },
            data: {
                password
            }
        });

        return this.createToken(user);
    }

    async register(data: AuthRegisterDto) {
        const user = await this.userService.create(data);

        return this.createToken(user);
    }
}
