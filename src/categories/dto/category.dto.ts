import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nome da categoria',
    example: 'Desenvolvimento Web',
  })
  @IsNotEmpty({ message: 'O nome da categoria é obrigatório' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Slug da categoria (URL-friendly)',
    example: 'desenvolvimento-web',
  })
  @IsNotEmpty({ message: 'O slug é obrigatório' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({
    description: 'ID da categoria pai (para subcategorias)',
    example: 1,
  })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'Nome da categoria' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Slug da categoria' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'ID da categoria pai' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}
