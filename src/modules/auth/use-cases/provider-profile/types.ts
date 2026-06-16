export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
}

export interface ProviderServiceDto {
  id: string;
  serviceId: string;
  categoryId: string;
  categoryName: string;
  serviceName: string;
  priceBase: number | null;
  priceType: string | null;
  estimatedDurationMinutes: number | null;
  pricePerHour: number | null;
  isActive: boolean;
}

export interface ProviderAvailabilityDto {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  additionalPercentage: number;
}

export interface GetCategoriesParams {}

export interface GetCategoriesResult {
  success: boolean;
  data: CategoryDto[];
}

export interface GetCategoriesUseCaseInterface {
  execute(params: GetCategoriesParams): Promise<GetCategoriesResult>;
}

export interface CreateProviderServiceParams {
  providerId: string;
  serviceId: string;
  estimatedDurationMinutes: number;
  pricePerHour: number;
  priceBase?: number;
  priceType?: string;
}

export interface CreateProviderServiceResult {
  success: boolean;
  data: ProviderServiceDto;
}

export interface CreateProviderServiceUseCaseInterface {
  execute(params: CreateProviderServiceParams): Promise<CreateProviderServiceResult>;
}

export interface GetProviderServicesParams {
  providerId: string;
}

export interface GetProviderServicesResult {
  success: boolean;
  data: ProviderServiceDto[];
}

export interface GetProviderServicesUseCaseInterface {
  execute(params: GetProviderServicesParams): Promise<GetProviderServicesResult>;
}

export interface UpdateProviderServiceParams {
  providerId: string;
  serviceId: string;
  estimatedDurationMinutes?: number;
  pricePerHour?: number;
  priceBase?: number;
  priceType?: string;
  isActive?: boolean;
}

export interface UpdateProviderServiceResult {
  success: boolean;
  data: ProviderServiceDto;
}

export interface UpdateProviderServiceUseCaseInterface {
  execute(params: UpdateProviderServiceParams): Promise<UpdateProviderServiceResult>;
}

export interface DeleteProviderServiceParams {
  providerId: string;
  serviceId: string;
}

export interface DeleteProviderServiceResult {
  success: boolean;
}

export interface DeleteProviderServiceUseCaseInterface {
  execute(params: DeleteProviderServiceParams): Promise<DeleteProviderServiceResult>;
}

export interface SetProviderAvailabilityParams {
  providerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  additionalPercentage?: number;
}

export interface SetProviderAvailabilityResult {
  success: boolean;
  data: ProviderAvailabilityDto;
}

export interface SetProviderAvailabilityUseCaseInterface {
  execute(params: SetProviderAvailabilityParams): Promise<SetProviderAvailabilityResult>;
}

export interface GetProviderAvailabilityParams {
  providerId: string;
}

export interface GetProviderAvailabilityResult {
  success: boolean;
  data: ProviderAvailabilityDto[];
}

export interface GetProviderAvailabilityUseCaseInterface {
  execute(params: GetProviderAvailabilityParams): Promise<GetProviderAvailabilityResult>;
}

export interface UpdateProviderAvailabilityParams {
  providerId: string;
  id: string;
  startTime: string;
  endTime: string;
  additionalPercentage?: number;
}

export interface UpdateProviderAvailabilityResult {
  success: boolean;
  data: ProviderAvailabilityDto;
}

export interface UpdateProviderAvailabilityUseCaseInterface {
  execute(params: UpdateProviderAvailabilityParams): Promise<UpdateProviderAvailabilityResult>;
}

export interface DeleteProviderAvailabilityParams {
  providerId: string;
  id: string;
}

export interface DeleteProviderAvailabilityResult {
  success: boolean;
}

export interface DeleteProviderAvailabilityUseCaseInterface {
  execute(params: DeleteProviderAvailabilityParams): Promise<DeleteProviderAvailabilityResult>;
}

export interface PaymentMethodTypeDto {
  id: string;
  name: string;
  label: string;
  icon: string | null;
}

export interface ProviderPaymentMethodDetailsEntry {
  paymentMethodTypeId: string;
  details: Record<string, string> | null;
}

export interface ProviderPaymentMethodDto {
  id: string;
  paymentMethodTypeId: string;
  name: string;
  label: string;
  icon: string | null;
  isEnabled: boolean;
  details: Record<string, string> | null;
}

export interface GetPaymentMethodTypesResult {
  success: boolean;
  data: PaymentMethodTypeDto[];
}

export interface GetPaymentMethodTypesUseCaseInterface {
  execute(): Promise<GetPaymentMethodTypesResult>;
}

export interface GetProviderPaymentMethodsParams {
  providerId: string;
}

export interface GetProviderPaymentMethodsResult {
  success: boolean;
  data: ProviderPaymentMethodDto[];
}

export interface GetProviderPaymentMethodsUseCaseInterface {
  execute(params: GetProviderPaymentMethodsParams): Promise<GetProviderPaymentMethodsResult>;
}

export interface SetProviderPaymentMethodsParams {
  providerId: string;
  methods: ProviderPaymentMethodDetailsEntry[];
}

export interface SetProviderPaymentMethodsResult {
  success: boolean;
}

export interface SetProviderPaymentMethodsUseCaseInterface {
  execute(params: SetProviderPaymentMethodsParams): Promise<SetProviderPaymentMethodsResult>;
}

export interface CheckPixKeyAvailabilityParams {
  providerId: string;
  pixKey: string;
}

export interface CheckPixKeyAvailabilityResult {
  available: boolean;
}

export interface CheckPixKeyAvailabilityUseCaseInterface {
  execute(params: CheckPixKeyAvailabilityParams): Promise<CheckPixKeyAvailabilityResult>;
}
