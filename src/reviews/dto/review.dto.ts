import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID do contrato a avaliar', example: 1 })
  @IsNotEmpty({ message: 'O ID do contrato é obrigatório' })
  @Type(() => String)
  @IsUUID()
  contractId: string;

  @ApiProperty({
    description: 'Nota de 1 a 5 estrelas',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty({ message: 'A nota é obrigatória' })
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'A nota mínima é 1' })
  @Max(5, { message: 'A nota máxima é 5' })
  rating: number;

  @ApiPropertyOptional({
    description: 'Comentário (opcional)',
    example: 'Excelente trabalho, muito profissional!',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
