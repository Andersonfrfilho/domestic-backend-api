import { ApiAuthGuard } from '@adatechnology/auth-keycloak';
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';

import { COMPANY_SERVICE_PROVIDE } from './company.token';
import { CompanyService } from './company.service';
import { Inject } from '@nestjs/common';

@UseGuards(ApiAuthGuard)
@Controller('companies')
export class CompanyController {
  constructor(
    @Inject(COMPANY_SERVICE_PROVIDE)
    private readonly companyService: CompanyService,
  ) {}

  @Post()
  async createCompany(
    @Body() body: {
      document: string;
      companyName: string;
      tradeName?: string;
      email: string;
      phone: string;
      stateRegistration?: string;
      municipalRegistration?: string;
    },
    @Req() req: any,
  ) {
    const userId = req.user?.sub;
    return this.companyService.createCompany({
      ...body,
      adminUserId: userId,
    });
  }

  @Get('me')
  async listMyCompanies(@Req() req: any) {
    const userId = req.user?.sub;
    return this.companyService.listUserCompanies(userId);
  }

  @Post(':companyId/members')
  async addMember(
    @Param('companyId') companyId: string,
    @Body() body: { userId: string; role: string },
  ) {
    return this.companyService.addMember({
      companyId,
      userId: body.userId,
      role: body.role,
    });
  }
}
