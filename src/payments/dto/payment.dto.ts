import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID do contrato', example: 1 })
  @IsNotEmpty({ message: 'O ID do contrato é obrigatório' })
  @Type(() => String)
  @IsUUID()
  contractId: string;

  @ApiProperty({
    description: 'Valor do pagamento (€). Deve ser >= valor do contrato.',
    example: 1200.0,
    minimum: 0.01,
  })
  @IsNotEmpty({ message: 'O valor é obrigatório' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'O valor deve ser positivo' })
  amount: number;
}
