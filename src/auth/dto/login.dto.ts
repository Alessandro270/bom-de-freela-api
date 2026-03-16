import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email do utilizador',
    example: 'joao@email.com',
  })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ description: 'Senha do utilizador', example: 'senha1234' })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @IsString()
  password: string;
}
