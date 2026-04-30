export class SendVerificationCodeRequestDto {
  destination: string;
  type: 'email' | 'phone';
}
