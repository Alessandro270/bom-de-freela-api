import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientProfileDto {
  @ApiPropertyOptional({
    description: 'Descrição do perfil do cliente',
    example: 'Empreendedor digital',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'URL da foto de perfil',
    example: 'https://example.com/photo.jpg',
  })
  @IsOptional()
  @IsString()
  profilePhoto?: string;
}

export class UpdateClientProfileDto {
  @ApiPropertyOptional({
    description: 'Descrição do perfil do cliente',
    example: 'Empreendedor digital atualizado',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'URL da foto de perfil' })
  @IsOptional()
  @IsString()
  profilePhoto?: string;
}

export class CreateFreelancerProfileDto {
  @ApiPropertyOptional({
    description: 'Título profissional',
    example: 'Desenvolvedor Full Stack',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Biografia profissional',
    example: 'Desenvolvedor com 5 anos de experiência...',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Lista de habilidades',
    example: ['Node.js', 'React', 'TypeScript'],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ description: 'NIF (obrigatório)', example: '123456789' })
  @IsString({ message: 'O NIF é obrigatório' })
  nif: string;

  @ApiProperty({
    description: 'Telefone (obrigatório)',
    example: '+351912345678',
  })
  @IsString({ message: 'O telefone é obrigatório' })
  phone: string;
}

export class UpdateFreelancerProfileDto {
  @ApiPropertyOptional({
    description: 'Título profissional',
    example: 'Desenvolvedor Full Stack Senior',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Biografia profissional' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Lista de habilidades', type: [String] })
  @IsOptional()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({ description: 'NIF' })
  @IsOptional()
  @IsString()
  nif?: string;

  @ApiPropertyOptional({ description: 'Telefone' })
  @IsOptional()
  @IsString()
  phone?: string;
}
