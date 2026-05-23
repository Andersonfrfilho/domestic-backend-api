import { SwaggerCustomOptions } from '@nestjs/swagger';

import { SWAGGER_CUSTOM_CSS_FINAL, SWAGGER_THEME_TOGGLE_JS } from '@config/constants';
import { EnvironmentProviderInterface } from '@config/interfaces/environment.interface';

interface SwaggerCustomConfigParams extends Partial<EnvironmentProviderInterface> {}

export const swaggerCustomOptions = (
  environment: SwaggerCustomConfigParams,
): SwaggerCustomOptions => ({
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'list',
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    filter: true,
    showRequestHeaders: true,
    supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
  },
  customCss: SWAGGER_CUSTOM_CSS_FINAL,
  customJsStr: SWAGGER_THEME_TOGGLE_JS,
  customSiteTitle: `${environment.projectName} API Documentation`,
});
