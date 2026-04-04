import type { CacheProviderInterface } from '@adatechnology/cache';
import { CACHE_PROVIDER } from '@adatechnology/cache';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Injectable,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import { type UserServiceInterface } from './use-cases/create-users/create-user.interface';
import { CreateUserRequestDto } from './use-cases/create-users/dtos/create-user-request.dto';
import { CreateUserResponseDto } from './use-cases/create-users/dtos/create-user-response.dto';
import { UpdateUserRequestDto } from './use-cases/update-user/dtos/update-user-request.dto';
import { USER_SERVICE_PROVIDE } from './user.token';

@Injectable()
@Controller('/users')
export class UserController {
  constructor(
    @Inject(USER_SERVICE_PROVIDE)
    private readonly userService: UserServiceInterface,
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: CacheProviderInterface,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar usuário', description: 'Cria usuário após registro no Keycloak.' })
  @ApiOkResponse({ type: CreateUserResponseDto })
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  async create(@Body() params: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    const user = await this.userService.createUser(params);
    await this.cacheProvider.del('users:list').catch(() => null);
    return user;
  }

  @Get('me')
  @ApiOperation({ summary: 'Perfil do usuário autenticado', description: 'Retorna o usuário com base no X-User-Id injetado pelo Kong.' })
  @ApiHeader({ name: 'X-User-Id', description: 'keycloak_id injetado pelo Kong', required: true })
  @ApiOkResponse({ type: CreateUserResponseDto })
  @ApiNotFoundResponse()
  async getMe(@Headers('x-user-id') keycloakId: string): Promise<CreateUserResponseDto> {
    return this.userService.getUserByKeycloakId(keycloakId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID interno' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: CreateUserResponseDto })
  @ApiNotFoundResponse()
  @ApiInternalServerErrorResponse()
  async findById(@Param('id') id: string): Promise<CreateUserResponseDto> {
    return this.userService.getUserById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: CreateUserResponseDto })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserRequestDto,
  ): Promise<CreateUserResponseDto> {
    return this.userService.updateUser(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar usuário (soft delete — status = DELETED)' })
  @ApiParam({ name: 'id', type: String })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  async delete(@Param('id') id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }
}
