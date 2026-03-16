import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract } from './entities/contract.entity.js';
import { Notification } from '../notifications/entities/notification.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { ContractStatus } from '../common/enums/contract-status.enum.js';
import { ProjectStatus } from '../common/enums/project-status.enum.js';
import { NotificationType } from '../common/enums/notification-type.enum.js';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findAll(userId: string): Promise<Contract[]> {
    return this.contractRepository.find({
      where: [{ clientProfile: { userId } }, { freelancerProfile: { userId } }],
      relations: [
        'project',
        'clientProfile',
        'clientProfile.user',
        'freelancerProfile',
        'freelancerProfile.user',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: [
        'project',
        'proposal',
        'clientProfile',
        'clientProfile.user',
        'freelancerProfile',
        'freelancerProfile.user',
        'payment',
        'reviews',
      ],
    });

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado');
    }

    return contract;
  }

  async complete(userId: string, id: string): Promise<Contract> {
    const contract = await this.findOne(id);

    // Apenas o cliente pode marcar como concluído
    if (contract.clientProfile.userId !== userId) {
      throw new ForbiddenException(
        'Apenas o cliente pode marcar o contrato como concluído',
      );
    }

    if (contract.status !== ContractStatus.ATIVO) {
      throw new BadRequestException(
        'Apenas contratos ativos podem ser concluídos',
      );
    }

    contract.status = ContractStatus.CONCLUIDO;
    await this.contractRepository.save(contract);

    // Atualizar estado do projeto
    const project = await this.projectRepository.findOne({
      where: { id: contract.projectId },
    });
    if (project) {
      project.status = ProjectStatus.CONCLUIDO;
      await this.projectRepository.save(project);
    }

    // Notificar freelancer
    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: contract.freelancerProfile.userId,
        type: NotificationType.CONTRATO_CRIADO,
        message: `O contrato do projeto "${contract.project.title}" foi concluído!`,
      }),
    );

    return contract;
  }

  async cancel(id: string): Promise<Contract> {
    const contract = await this.findOne(id);

    if (contract.status === ContractStatus.CANCELADO) {
      throw new BadRequestException('Este contrato já está cancelado');
    }

    contract.status = ContractStatus.CANCELADO;
    return this.contractRepository.save(contract);
  }
}
