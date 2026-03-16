import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Repository,
  DeepPartial,
  FindOptionsWhere,
  ObjectLiteral,
} from 'typeorm';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';

@Injectable()
export class GenericService<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 20,
    where?: FindOptionsWhere<T>,
    relations?: string[],
    order?: Record<string, 'ASC' | 'DESC'>,
  ): Promise<PaginatedResult<T>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      where,
      relations,
      order: order as any,
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneById(id: string, relations?: string[]): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as any,
      relations,
    });
    if (!entity) throw new NotFoundException('Recurso não encontrado');
    return entity;
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: string, data: DeepPartial<T>): Promise<T> {
    const entity = await this.findOneById(id);
    Object.assign(entity, data);
    return this.repository.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findOneById(id);
    await this.repository.remove(entity);
  }
}
