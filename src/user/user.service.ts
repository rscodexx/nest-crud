import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePutUserDto } from './dto/update-put-user.dto';
import { UpdatePatchUserDto } from './dto/update-patch-user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}
    async create({ name, email, password, role }: CreateUserDto) {
        password = await bcrypt.hash(password, await bcrypt.genSalt());

        return this.prisma.user.create({
            data: {
                name,
                email,
                password,
                role
            }
        });
    }
    async list() {
        return this.prisma.user.findMany();
    }
    async show(id: number) {
        return this.prisma.user.findUnique({
            where: {
                id
            }
        });
    }
    async update(
        id: number,
        { name, email, password, role }: UpdatePutUserDto
    ) {
        await this.exists(id);

        password = await bcrypt.hash(password, await bcrypt.genSalt());

        return this.prisma.user.update({
            data: { name, email, password, role },
            where: {
                id
            }
        });
    }
    async updatePartial(id: number, { name }: UpdatePatchUserDto) {
        await this.exists(id);

        return this.prisma.user.update({
            data: name,
            where: {
                id
            }
        });
    }
    async delete(id: number) {
        await this.exists(id);

        return this.prisma.user.delete({
            where: {
                id
            }
        });
    }
    async exists(id: number) {
        if (!(await this.show(id))) {
            throw new NotFoundException(`User ${id} not found`);
        }
    }
}
