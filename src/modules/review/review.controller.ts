import { AuthUser, B2CGuard, Roles, RolesGuard } from '@adatechnology/auth-keycloak';
import { Body, Controller, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ROLES } from '@modules/shared/constants';
import { Review } from '@modules/shared/providers/database/entities/review.entity';
import { type UserServiceInterface } from '@modules/user/use-cases/create-users/create-user.interface';
import { USER_SERVICE_PROVIDE } from '@modules/user/user.token';

import { type ReviewServiceInterface } from './review.service';
import { REVIEW_SERVICE_PROVIDE } from './review.token';
import { CreateReviewRequestDto } from './use-cases/create-review/dtos/create-review-request.dto';

@ApiTags('Reviews')
@Controller('/reviews')
export class ReviewController {
  constructor(
    @Inject(REVIEW_SERVICE_PROVIDE)
    private readonly reviewService: ReviewServiceInterface,
    @Inject(USER_SERVICE_PROVIDE)
    private readonly userService: UserServiceInterface,
  ) {}

  @Post()
  @Roles(ROLES.REVIEW.MANAGER)
  @UseGuards(B2CGuard, RolesGuard)
  @ApiOperation({ summary: 'Criar avaliação de prestador (CUSTOMER)' })
  @ApiHeader({ name: 'X-Access-Token', required: true, description: 'User JWT forwarded by Kong' })
  @ApiOkResponse({ type: Review })
  @ApiConflictResponse({ description: 'Review já existe para esta solicitação' })
  @ApiBadRequestResponse({ description: 'Solicitação não está COMPLETED' })
  async create(
    @AuthUser() keycloakId: string,
    @Body() body: CreateReviewRequestDto,
  ): Promise<Review> {
    const user = await this.userService.getUserByKeycloakId(keycloakId);
    return this.reviewService.create({ ...body, contractorId: user.id });
  }

  @Get('provider/:providerId')
  @ApiOperation({ summary: 'Listar avaliações de um prestador' })
  @ApiOkResponse({ type: [Review] })
  async listByProvider(@Param('providerId') providerId: string): Promise<Review[]> {
    return this.reviewService.listByProvider(providerId);
  }
}
