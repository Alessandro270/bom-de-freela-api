import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../users/entities/user.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { Contract } from '../contracts/entities/contract.entity.js';
import { Payment } from '../payments/entities/payment.entity.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async getDashboard() {
    const [totalUsers, totalProjects, totalContracts, payments] =
      await Promise.all([
        this.userRepository.count(),
        this.projectRepository.count(),
        this.contractRepository.count(),
        this.paymentRepository.find(),
      ]);

    const totalPaymentVolume = payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0,
    );

    return {
      totalUsers,
      totalProjects,
      totalContracts,
      totalPayments: payments.length,
      totalPaymentVolume: Math.round(totalPaymentVolume * 100) / 100,
    };
  }

  async listUsers(
    query: PaginationQueryDto & { search?: string },
  ): Promise<PaginatedResult<any>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.clientProfile', 'clientProfile')
      .leftJoinAndSelect('user.freelancerProfile', 'freelancerProfile');

    if (query.search) {
      qb.where('(user.name LIKE :search OR user.email LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    qb.orderBy('user.createdAt', 'DESC');

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    const mappedData = data.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      hasClientProfile: !!user.clientProfile,
      hasFreelancerProfile: !!user.freelancerProfile,
      createdAt: user.createdAt,
    }));

    return {
      data: mappedData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async toggleUserStatus(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      return { message: 'Utilizador não encontrado' };
    }

    user.isActive = !user.isActive;
    await this.userRepository.save(user);

    return {
      message: user.isActive ? 'Conta ativada' : 'Conta desativada',
      isActive: user.isActive,
    };
  }

  async listProjects(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Project>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.projectRepository.findAndCount({
      relations: ['clientProfile', 'clientProfile.user', 'category'],
      order: { createdAt: 'DESC' },
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

  async listContracts(
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Contract>> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.contractRepository.findAndCount({
      relations: [
        'project',
        'clientProfile',
        'clientProfile.user',
        'freelancerProfile',
        'freelancerProfile.user',
      ],
      order: { createdAt: 'DESC' },
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

  async getPaymentsSummary() {
    const payments = await this.paymentRepository.find({
      relations: ['contract', 'contract.project'],
    });

    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      totalPayments: payments.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        paidAt: p.paidAt,
        project: p.contract?.project?.title,
      })),
    };
  }
}
