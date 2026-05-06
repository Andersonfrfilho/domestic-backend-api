export interface SetCompanyBusinessHoursUseCaseInterface {
  execute(params: SetCompanyBusinessHoursUseCaseParams): Promise<SetCompanyBusinessHoursUseCaseResponse>;
}

export interface BusinessHourItem {
  dayOfWeek: number;
  isOpen: boolean;
  openTime?: string | null;
  closeTime?: string | null;
}

export interface SetCompanyBusinessHoursUseCaseParams {
  companyId: string;
  businessHours: BusinessHourItem[];
}

export interface SetCompanyBusinessHoursUseCaseResponse {
  businessHours: Array<{
    id: string;
    companyId: string;
    dayOfWeek: number;
    isOpen: boolean;
    openTime: string | null;
    closeTime: string | null;
  }>;
}
