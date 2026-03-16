import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProposalDto {
  @ApiProperty({ description: 'ID do projeto', example: 1 })
  @IsNotEmpty({ message: 'O ID do projeto é obrigatório' })
  @Type(() => String)
  @IsUUID()
  projectId: string;

  @ApiProperty({
    description: 'Valor da proposta (€)',
    example: 1200.0,
    minimum: 0.01,
  })
  @IsNotEmpty({ message: 'O valor é obrigatório' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'O valor deve ser positivo' })
  value: number;

  @ApiProperty({
    description: 'Prazo estimado em dias',
    example: 30,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'O prazo estimado é obrigatório' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'O prazo deve ser positivo' })
  estimatedDays: number;

  @ApiProperty({
    description: 'Mensagem de apresentação',
    example:
      'Tenho experiência em projetos similares e posso entregar em 30 dias...',
  })
  @IsNotEmpty({ message: 'A mensagem é obrigatória' })
  @IsString()
  message: string;
}

export class UpdateProposalDto {
  @ApiPropertyOptional({ description: 'Valor da proposta (€)', minimum: 0.01 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  value?: number;

  @ApiPropertyOptional({ description: 'Prazo estimado em dias', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  estimatedDays?: number;

  @ApiPropertyOptional({ description: 'Mensagem de apresentação' })
  @IsOptional()
  @IsString()
  message?: string;
}
