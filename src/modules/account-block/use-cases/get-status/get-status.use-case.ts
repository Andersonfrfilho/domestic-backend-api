import { LOGGER_PROVIDER } from '@adatechnology/logger';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TraceMethod } from '@adatechnology/logger';

import type { LogProviderInterface } from '@modules/shared/interfaces/log.interface';
import { CONNECTIONS_NAMES } from '@app/modules/shared/providers/database/database.constant';
import { AccountBlock } from '@app/modules/shared/providers/database/entities/account-block.entity';

import {
  GetAccountBlockStatusUseCaseInterface,
  GetAccountBlockStatusParams,
  AccountBlockStatus,
  AccountBlockReason,
  BlockAction,
} from './get-status.interface';

const REASON_CONFIG: Record<AccountBlockReason, {
  title: string; icon: string; severity: 'error' | 'warning' | 'info';
  defaultMessage: string; getActions: () => BlockAction[];
}> = {
  EMAIL_CONFLICT: {
    title: 'Conta Temporariamente Bloqueada',
    icon: 'mail-outline',
    severity: 'error',
    defaultMessage: 'Detectamos que este e-mail já está verificado em outra conta. Para sua segurança, esta conta foi temporariamente bloqueada.',
    getActions: () => [
      { type: 'contact_support', label: 'Falar com Suporte', variant: 'primary' },
      { type: 'go_to_login', label: 'Voltar para o Login', variant: 'outline' },
    ],
  },
  PHONE_CONFLICT: {
    title: 'Conta Temporariamente Bloqueada',
    icon: 'call-outline',
    severity: 'error',
    defaultMessage: 'Detectamos que este telefone já está verificado em outra conta. Para sua segurança, esta conta foi temporariamente bloqueada.',
    getActions: () => [
      { type: 'contact_support', label: 'Falar com Suporte', variant: 'primary' },
      { type: 'go_to_login', label: 'Voltar para o Login', variant: 'outline' },
    ],
  },
  DOCUMENT_CONFLICT: {
    title: 'Conta Temporariamente Bloqueada',
    icon: 'document-outline',
    severity: 'error',
    defaultMessage: 'Detectamos que este documento já está registrado em outra conta. Para sua segurança, esta conta foi temporariamente bloqueada.',
    getActions: () => [
      { type: 'contact_support', label: 'Falar com Suporte', variant: 'primary' },
      { type: 'go_to_login', label: 'Voltar para o Login', variant: 'outline' },
    ],
  },
  FRAUD_SUSPICION: {
    title: 'Conta Bloqueada por Segurança',
    icon: 'shield-outline',
    severity: 'error',
    defaultMessage: 'Detectamos atividade suspeita na sua conta. Por segurança, ela foi bloqueada.',
    getActions: () => [
      { type: 'contact_support', label: 'Falar com Suporte', variant: 'primary' },
      { type: 'logout', label: 'Sair', variant: 'outline' },
    ],
  },
  VERIFICATION_FAILED: {
    title: 'Muitas Tentativas',
    icon: 'time-outline',
    severity: 'warning',
    defaultMessage: 'Muitas tentativas de verificação falharam. Tente novamente mais tarde.',
    getActions: () => [
      { type: 'retry', label: 'Tentar Novamente', route: '/verification', variant: 'primary' },
      { type: 'contact_support', label: 'Falar com Suporte', variant: 'secondary' },
    ],
  },
  TERMS_VIOLATION: {
    title: 'Termos Violados',
    icon: 'warning-outline',
    severity: 'warning',
    defaultMessage: 'Sua conta foi bloqueada por violação dos termos de uso.',
    getActions: () => [
      { type: 'contact_support', label: 'Falar com Suporte', variant: 'primary' },
      { type: 'dismiss', label: 'Entendi', variant: 'outline' },
    ],
  },
  MANUAL_BLOCK: {
    title: 'Conta Bloqueada',
    icon: 'lock-closed-outline',
    severity: 'error',
    defaultMessage: 'Sua conta foi bloqueada por um administrador.',
    getActions: () => [
      { type: 'contact_support', label: 'Falar com Suporte', variant: 'primary' },
      { type: 'logout', label: 'Sair', variant: 'outline' },
    ],
  },
  ACCOUNT_DISABLED: {
    title: 'Conta Desativada',
    icon: 'person-outline',
    severity: 'info',
    defaultMessage: 'Esta conta foi desativada.',
    getActions: () => [
      { type: 'contact_support', label: 'Falar com Suporte', variant: 'primary' },
      { type: 'go_to_login', label: 'Voltar para o Login', variant: 'outline' },
    ],
  },
};

export const GET_STATUS_LOG_MESSAGES = {
  START_FLOW: 'Starting get account block status flow',
  NOT_BLOCKED: 'Account is not blocked',
  BLOCKED: 'Account is blocked',
} as const;

@Injectable()
export class GetAccountBlockStatusUseCase implements GetAccountBlockStatusUseCaseInterface {
  private readonly logContext = `${this.constructor.name}.execute`;

  constructor(
    @InjectRepository(AccountBlock, CONNECTIONS_NAMES.POSTGRES)
    private readonly accountBlockRepository: Repository<AccountBlock>,
    @Inject(LOGGER_PROVIDER)
    private readonly logProvider: LogProviderInterface,
  ) {}

  @TraceMethod()
  async execute(params: GetAccountBlockStatusParams): Promise<AccountBlockStatus> {
    this.logProvider.info({
      message: GET_STATUS_LOG_MESSAGES.START_FLOW,
      context: this.logContext,
      meta: { userId: params.userId },
    });

    const activeBlock = await this.accountBlockRepository.findOne({
      where: { userId: params.userId, resolvedAt: null } as any,
      order: { blockedAt: 'DESC' },
    });

    if (!activeBlock) {
      this.logProvider.info({
        message: GET_STATUS_LOG_MESSAGES.NOT_BLOCKED,
        context: this.logContext,
        meta: { userId: params.userId },
      });
      return { blocked: false, status: 'ACTIVE', reason: null, message: null, title: null, icon: null, severity: null, actions: [], canRetryAt: null };
    }

    const reason = activeBlock.reason as AccountBlockReason;
    const config = REASON_CONFIG[reason];

    this.logProvider.info({
      message: GET_STATUS_LOG_MESSAGES.BLOCKED,
      context: this.logContext,
      meta: { userId: params.userId, reason },
    });

    return {
      blocked: true,
      status: 'BLOCKED',
      reason,
      message: activeBlock.message || config.defaultMessage,
      title: config.title,
      icon: config.icon,
      severity: config.severity,
      actions: config.getActions(),
      canRetryAt: activeBlock.canRetryAt?.toISOString() ?? null,
    };
  }
}
