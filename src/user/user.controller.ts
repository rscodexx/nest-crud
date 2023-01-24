import {
    Body,
    Controller,
    Delete,
    Get,
    Param, ParseIntPipe,
    Patch,
    Post,
    Put, UseGuards, UseInterceptors
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePutUserDto } from './dto/update-put-user.dto';
import { UpdatePatchUserDto } from './dto/update-patch-user.dto';
import { UserService } from './user.service';
import { LogInterceptor } from '../interceptors/log.interceptor';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { RoleGuard } from '../guards/role.guard';
import { AuthGuard } from '../guards/auth.guard';

@UseGuards(AuthGuard, RoleGuard)
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}
    @Roles(Role.Admin)
    @Post()
    async create(@Body() { name, email, password, role }: CreateUserDto) {
        return this.userService.create({ name, email, password, role });
    }
    @Roles(Role.Admin)
    @Get()
    async read() {
        return this.userService.list();
    }
    @Roles(Role.Admin)
    @Get(':id')
    async readOne(@Param('id', ParseIntPipe) id: number) {
        return this.userService.show(id);
    }
    @Roles(Role.Admin)
    @Put(':id')
    async update(
        @Body() data: UpdatePutUserDto,
        @Param('id', ParseIntPipe) id
    ) {
        return this.userService.update(id, data);
    }
    @Roles(Role.Admin)
    @Patch(':id')
    async updatePartial(
        @Body() data: UpdatePatchUserDto,
        @Param('id', ParseIntPipe) id
    ) {
        return this.userService.updatePartial(id, data);
    }
    @Roles(Role.Admin)
    @Delete(':id')
    async delete(@Param('id', ParseIntPipe) id) {
        return this.userService.delete(id);
    }
}
