import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal } from './entities/proposal.entity.js';
import { Project } from '../projects/entities/project.entity.js';
import { FreelancerProfile } from '../profiles/entities/freelancer-profile.entity.js';
import { Contract } from '../contracts/entities/contract.entity.js';
import { Notification } from '../notifications/entities/notification.entity.js';
import { CreateProposalDto, UpdateProposalDto } from './dto/proposal.dto.js';
import { ProposalStatus } from '../common/enums/proposal-status.enum.js';
import { ProjectStatus } from '../common/enums/project-status.enum.js';
import { ContractStatus } from '../common/enums/contract-status.enum.js';
import { NotificationType } from '../common/enums/notification-type.enum.js';

@Injectable()
export class ProposalsService {
  constructor(
    @InjectRepository(Proposal)
    private readonly proposalRepository: Repository<Proposal>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(FreelancerProfile)
    private readonly freelancerProfileRepository: Repository<FreelancerProfile>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(userId: string, dto: CreateProposalDto): Promise<Proposal> {
    const freelancerProfile = await this.freelancerProfileRepository.findOne({
      where: { userId },
    });

    if (!freelancerProfile) {
      throw new ForbiddenException(
        'É necessário ter um perfil de freelancer para enviar propostas',
      );
    }

    const project = await this.projectRepository.findOne({
      where: { id: dto.projectId },
      relations: ['clientProfile'],
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    if (project.status !== ProjectStatus.ABERTO) {
      throw new BadRequestException(
        'Este projeto não está aberto para propostas',
      );
    }

    // Verificar se o freelancer é o dono do projeto (perfil duplo)
    if (project.clientProfile.userId === userId) {
      throw new ForbiddenException(
        'Não pode enviar proposta ao seu próprio projeto',
      );
    }

    // Verificar se já tem proposta ativa neste projeto
    const existingProposal = await this.proposalRepository.findOne({
      where: {
        projectId: dto.projectId,
        freelancerProfileId: freelancerProfile.id,
        status: ProposalStatus.PENDENTE,
      },
    });

    if (existingProposal) {
      throw new ConflictException('Já possui uma proposta ativa neste projeto');
    }

    const proposal = this.proposalRepository.create({
      ...dto,
      freelancerProfileId: freelancerProfile.id,
    });

    const savedProposal = await this.proposalRepository.save(proposal);

    // Notificar o cliente
    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: project.clientProfile.userId,
        type: NotificationType.NOVA_PROPOSTA,
        message: `Nova proposta recebida no projeto "${project.title}"`,
      }),
    );

    return savedProposal;
  }

  async findMine(userId: string): Promise<Proposal[]> {
    const freelancerProfile = await this.freelancerProfileRepository.findOne({
      where: { userId },
    });

    if (!freelancerProfile) {
      return [];
    }

    return this.proposalRepository.find({
      where: { freelancerProfileId: freelancerProfile.id },
      relations: [
        'project',
        'project.clientProfile',
        'project.clientProfile.user',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateProposalDto,
  ): Promise<Proposal> {
    const proposal = await this.getProposalForFreelancer(userId, id);

    if (proposal.status !== ProposalStatus.PENDENTE) {
      throw new BadRequestException(
        'Apenas propostas pendentes podem ser editadas',
      );
    }

    Object.assign(proposal, dto);
    return this.proposalRepository.save(proposal);
  }

  async withdraw(userId: string, id: string): Promise<Proposal> {
    const proposal = await this.getProposalForFreelancer(userId, id);

    if (proposal.status !== ProposalStatus.PENDENTE) {
      throw new BadRequestException(
        'Apenas propostas pendentes podem ser retiradas',
      );
    }

    proposal.status = ProposalStatus.RETIRADA;
    return this.proposalRepository.save(proposal);
  }

  async accept(
    userId: string,
    id: string,
  ): Promise<{ proposal: Proposal; contract: Contract }> {
    const proposal = await this.proposalRepository.findOne({
      where: { id },
      relations: ['project', 'project.clientProfile', 'freelancerProfile'],
    });

    if (!proposal) {
      throw new NotFoundException('Proposta não encontrada');
    }

    // Verificar se é o dono do projeto
    if (proposal.project.clientProfile.userId !== userId) {
      throw new ForbiddenException(
        'Apenas o dono do projeto pode aceitar propostas',
      );
    }

    if (proposal.status !== ProposalStatus.PENDENTE) {
      throw new BadRequestException('Esta proposta não está pendente');
    }

    // Aceitar a proposta
    proposal.status = ProposalStatus.ACEITE;
    await this.proposalRepository.save(proposal);

    // Recusar todas as outras propostas pendentes do projeto
    await this.proposalRepository
      .createQueryBuilder()
      .update(Proposal)
      .set({ status: ProposalStatus.RECUSADA })
      .where('projectId = :projectId', { projectId: proposal.projectId })
      .andWhere('id != :id', { id: proposal.id })
      .andWhere('status = :status', { status: ProposalStatus.PENDENTE })
      .execute();

    // Atualizar o estado do projeto para "Em Andamento"
    proposal.project.status = ProjectStatus.EM_ANDAMENTO;
    await this.projectRepository.save(proposal.project);

    // Criar contrato automaticamente
    const contract = this.contractRepository.create({
      value: proposal.value,
      status: ContractStatus.ATIVO,
      proposalId: proposal.id,
      projectId: proposal.projectId,
      clientProfileId: proposal.project.clientProfileId,
      freelancerProfileId: proposal.freelancerProfileId,
    });

    const savedContract = await this.contractRepository.save(contract);

    // Notificar o freelancer
    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: proposal.freelancerProfile.userId,
        type: NotificationType.PROPOSTA_ACEITE,
        message: `A sua proposta no projeto "${proposal.project.title}" foi aceite!`,
      }),
    );

    // Notificar sobre o contrato
    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: proposal.freelancerProfile.userId,
        type: NotificationType.CONTRATO_CRIADO,
        message: `Contrato criado para o projeto "${proposal.project.title}"`,
      }),
    );

    return { proposal, contract: savedContract };
  }

  async reject(userId: string, id: string): Promise<Proposal> {
    const proposal = await this.proposalRepository.findOne({
      where: { id },
      relations: ['project', 'project.clientProfile', 'freelancerProfile'],
    });

    if (!proposal) {
      throw new NotFoundException('Proposta não encontrada');
    }

    if (proposal.project.clientProfile.userId !== userId) {
      throw new ForbiddenException(
        'Apenas o dono do projeto pode recusar propostas',
      );
    }

    if (proposal.status !== ProposalStatus.PENDENTE) {
      throw new BadRequestException('Esta proposta não está pendente');
    }

    proposal.status = ProposalStatus.RECUSADA;
    await this.proposalRepository.save(proposal);

    // Notificar o freelancer
    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: proposal.freelancerProfile.userId,
        type: NotificationType.PROPOSTA_RECUSADA,
        message: `A sua proposta no projeto "${proposal.project.title}" foi recusada.`,
      }),
    );

    return proposal;
  }

  private async getProposalForFreelancer(
    userId: string,
    proposalId: string,
  ): Promise<Proposal> {
    const freelancerProfile = await this.freelancerProfileRepository.findOne({
      where: { userId },
    });

    if (!freelancerProfile) {
      throw new ForbiddenException('Perfil de freelancer não encontrado');
    }

    const proposal = await this.proposalRepository.findOne({
      where: { id: proposalId, freelancerProfileId: freelancerProfile.id },
      relations: ['project'],
    });

    if (!proposal) {
      throw new NotFoundException('Proposta não encontrada');
    }

    return proposal;
  }
}
