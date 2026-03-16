import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Nome completo do utilizador',
    example: 'João Silva',
  })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email do utilizador',
    example: 'joao@email.com',
  })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({
    description: 'Senha (mínimo 8 caracteres)',
    example: 'senha1234',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  password: string;
}
