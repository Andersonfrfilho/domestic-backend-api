import { ApiAuthGuard } from '@adatechnology/nestjs-auth-keycloak';
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Inject } from '@nestjs/common';

import { COMPANY_SERVICE_PROVIDE } from './company.token';
import { CompanyService } from './company.service';

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

  @Get(':companyId')
  async getCompanyDetails(@Param('companyId') companyId: string) {
    return this.companyService.getDetails(companyId);
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

  @Post(':companyId/addresses')
  async addAddress(
    @Param('companyId') companyId: string,
    @Body() body: {
      type: string;
      zipCode: string;
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      country?: string;
      latitude?: number;
      longitude?: number;
      isDefault?: boolean;
    },
  ) {
    return this.companyService.addAddress({ companyId, ...body });
  }

  @Post(':companyId/emails')
  async addEmail(
    @Param('companyId') companyId: string,
    @Body() body: { email: string; type?: string; isDefault?: boolean },
  ) {
    return this.companyService.addEmail({ companyId, ...body });
  }

  @Post(':companyId/phones')
  async addPhone(
    @Param('companyId') companyId: string,
    @Body() body: { phone: string; type?: string; isDefault?: boolean },
  ) {
    return this.companyService.addPhone({ companyId, ...body });
  }

  @Post(':companyId/business-hours')
  async setBusinessHours(
    @Param('companyId') companyId: string,
    @Body() body: { businessHours: Array<{ dayOfWeek: number; isOpen: boolean; openTime?: string; closeTime?: string }> },
  ) {
    return this.companyService.setBusinessHours({ companyId, businessHours: body.businessHours });
  }

  @Post(':companyId/providers')
  async addProvider(
    @Param('companyId') companyId: string,
    @Body() body: { providerId: string; role?: string; commissionRate?: number; fixedSalary?: number },
  ) {
    return this.companyService.addProvider({ companyId, ...body });
  }
}
