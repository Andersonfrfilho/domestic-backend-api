import {
  Body,
  Controller,
  Get,
  Inject,
  Injectable,
  Post,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';

import type { CacheProviderInterface } from '@modules/shared/infrastructure/providers/cache/cache.interface';
import { CACHE_PROVIDER } from '@modules/shared/infrastructure/providers/cache/cache.token';
import type { UserServiceInterface } from '@modules/user/application/interfaces/user.interface';
import { USER_SERVICE_PROVIDE } from '@modules/user/infrastructure/user.token';
import { CreateUserRequestDto } from '@modules/user/shared/dtos/create-user-request.dto';
import { CreateUserResponseDto } from '@modules/user/shared/dtos/create-user-response.dto';
import { UpdateUserRequestDto } from '@modules/user/shared/dtos/update-user-request.dto';

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
      const cachedUsers = await this.cacheProvider.getDecrypted(cacheKey);
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

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar um usuário pelo ID',
    description: 'Retorna os detalhes de um único usuário.',
  })
  @ApiParam({ name: 'id', description: 'ID do usuário', type: 'string' })
  @ApiOkResponse({ description: 'Usuário encontrado com sucesso.' })
  @ApiBadRequestResponse()
  async findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get('keycloak/:keycloakId')
  @ApiOperation({
    summary: 'Buscar um usuário pelo Keycloak ID',
    description: 'Retorna os detalhes de um único usuário via keycloakId.',
  })
  @ApiParam({ name: 'keycloakId', description: 'Keycloak ID', type: 'string' })
  @ApiOkResponse({ description: 'Usuário encontrado com sucesso.' })
  @ApiBadRequestResponse()
  async findByKeycloakId(@Param('keycloakId') keycloakId: string) {
    return this.userService.findByKeycloakId(keycloakId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar um usuário',
    description: 'Atualiza os dados de um usuário existente.',
  })
  @ApiParam({ name: 'id', description: 'ID do usuário', type: 'string' })
  @ApiOkResponse({ description: 'Usuário atualizado com sucesso.' })
  @ApiBadRequestResponse()
  async update(@Param('id') id: string, @Body() params: UpdateUserRequestDto) {
    try {
      await this.cacheProvider.del('users:list');
    } catch (error) {
      console.error('Failed to invalidate cache:', error);
    }
    return this.userService.update(id, params);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Deletar um usuário',
    description: 'Deleta o usuário especificado.',
  })
  @ApiParam({ name: 'id', description: 'ID do usuário', type: 'string' })
  @ApiOkResponse({ description: 'Usuário deletado com sucesso.' })
  @ApiBadRequestResponse()
  async delete(@Param('id') id: string) {
    try {
      await this.cacheProvider.del('users:list');
    } catch (error) {
      console.error('Failed to invalidate cache:', error);
    }
    return this.userService.delete(id);
  }
}
