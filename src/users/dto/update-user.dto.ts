import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateNameDto {
  @ApiProperty({
    description: 'Novo nome do utilizador',
    example: 'João Silva Novo',
  })
  @IsString()
  name: string;
}

export class UpdateEmailDto {
  @ApiProperty({ description: 'Novo email', example: 'novo@email.com' })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'Senha atual para confirmação',
    example: 'senha1234',
  })
  @IsString()
  password: string;
}

export class UpdatePasswordDto {
  @ApiProperty({ description: 'Senha atual', example: 'senha1234' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: 'Nova senha', example: 'novaSenha123' })
  @IsString()
  newPassword: string;
}
