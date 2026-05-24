import { Injectable, NotFoundException } from '@nestjs/common';
import { TraceMethod } from '@app/shared/decorators/trace-method.decorator';

import { LookupCepResponse, LookupCepUseCaseInterface } from './lookup-cep.interface';

@Injectable()
export class LookupCepUseCase implements LookupCepUseCaseInterface {
  @TraceMethod()
  async execute(cep: string): Promise<LookupCepResponse> {
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) {
      throw new NotFoundException('CEP inválido');
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);

    if (!response.ok) {
      throw new NotFoundException('CEP não encontrado');
    }

    const data = (await response.json()) as {
      cep: string;
      logradouro: string;
      bairro: string;
      localidade: string;
      uf: string;
      erro?: boolean;
    };

    if (data.erro) {
      throw new NotFoundException('CEP não encontrado');
    }

    const lat = null;
    const lng = null;

    return {
      cep: data.cep,
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      lat,
      lng,
    };
  }
}
