import type { CacheProviderInterface } from '@adatechnology/cache';
import { CACHE_PROVIDER } from '@adatechnology/cache';
import { Body, Controller, Get, Inject, Injectable, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { type UserServiceInterface } from './use-cases/create-users/create-user.interface';
import { CreateUserRequestDto } from './use-cases/create-users/dtos/create-user-request.dto';
import { CreateUserResponseDto } from './use-cases/create-users/dtos/create-user-response.dto';
import { USER_SERVICE_PROVIDE } from './user.token';

@Injectable()
@Controller('/user')
export class UserController {
  constructor(
    @Inject(USER_SERVICE_PROVIDE)
    private readonly userService: UserServiceInterface,
    @Inject(CACHE_PROVIDER)
    private readonly cacheProvider: CacheProviderInterface,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Criar um novo usuário',
    description: 'Cria um novo registro de usuário com full_name, keycloak_id e status.',
  })
  @ApiOkResponse({
    description: 'Usuário criado com sucesso.',
    type: CreateUserResponseDto,
  })
  @ApiBadRequestResponse()
  @ApiInternalServerErrorResponse()
  async create(@Body() params: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    const user = await this.userService.createUser(params);

    try {
      await this.cacheProvider.del('users:list');
    } catch (error) {
      console.error('Failed to invalidate cache:', error);
    }

    return user;
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description: 'Retorna uma lista de todos os usuários com cache.',
  })
  @ApiOkResponse({
    description: 'Lista de usuários retornada com sucesso.',
  })
  @ApiInternalServerErrorResponse()
  async findAll() {
    const cacheKey = 'users:list';

    try {
      const cachedUsers = await this.cacheProvider.getEncrypted<CreateUserResponseDto[]>(cacheKey);
      if (cachedUsers) {
        return {
          data: cachedUsers,
          source: 'cache',
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error('Cache read error:', error);
    }

    // TODO: Implement findAll in UserService/Repository
    const users: CreateUserResponseDto[] = [];

    try {
      await this.cacheProvider.setEncrypted(cacheKey, users, 300);
    } catch (error) {
      console.error('Cache write error:', error);
    }

    return {
      data: users,
      source: 'database',
      timestamp: new Date().toISOString(),
    };
  }
}
