import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsPositive,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Título do projeto',
    example: 'Desenvolvimento de website corporativo',
  })
  @IsNotEmpty({ message: 'O título é obrigatório' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Descrição detalhada do projeto',
    example: 'Necessitamos de um website responsivo com...',
  })
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Orçamento do projeto (€)',
    example: 1500.0,
    minimum: 0.01,
  })
  @IsNotEmpty({ message: 'O orçamento é obrigatório' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'O orçamento deve ser um valor positivo' })
  budget: number;

  @ApiPropertyOptional({
    description: 'ID da categoria principal',
    example: 'string',
  })
  @IsOptional()
  @Type(() => String)
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'ID da subcategoria', example: 'string' })
  @IsOptional()
  @Type(() => String)
  @IsUUID()
  subcategoryId?: string;

  @ApiPropertyOptional({
    description: 'Habilidades necessárias',
    example: ['Node.js', 'React', 'MySQL'],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  skills?: string[];
}

export class UpdateProjectDto {
  @ApiPropertyOptional({ description: 'Título do projeto' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Descrição do projeto' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Orçamento (€)', minimum: 0.01 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'O orçamento deve ser um valor positivo' })
  budget?: number;

  @ApiPropertyOptional({ description: 'ID da categoria' })
  @IsOptional()
  @Type(() => String)
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'ID da subcategoria' })
  @IsOptional()
  @Type(() => String)
  @IsUUID()
  subcategoryId?: string;

  @ApiPropertyOptional({
    description: 'Habilidades necessárias',
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  skills?: string[];
}

export class ProjectFilterDto {
  @ApiPropertyOptional({ description: 'Filtrar por categoria', example: 1 })
  @IsOptional()
  @Type(() => String)
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por subcategoria', example: 3 })
  @IsOptional()
  @Type(() => String)
  @IsUUID()
  subcategoryId?: string;

  @ApiPropertyOptional({ description: 'Orçamento mínimo (€)', example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minBudget?: number;

  @ApiPropertyOptional({ description: 'Orçamento máximo (€)', example: 5000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxBudget?: number;

  @ApiPropertyOptional({
    description: 'Pesquisa por título ou descrição',
    example: 'website',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Número da página',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Registos por página',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}
