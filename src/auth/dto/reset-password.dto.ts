import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token de recuperação recebido por email' })
  @IsNotEmpty({ message: 'O token é obrigatório' })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Nova senha (mínimo 8 caracteres)',
    example: 'novaSenha123',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'A nova senha é obrigatória' })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  newPassword: string;
}
