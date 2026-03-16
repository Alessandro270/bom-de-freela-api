import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity.js';
import { ClientProfile } from '../profiles/entities/client-profile.entity.js';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectFilterDto,
} from './dto/project.dto.js';
import { ProjectStatus } from '../common/enums/project-status.enum.js';
import { ContractStatus } from '../common/enums/contract-status.enum.js';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface.js';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ClientProfile)
    private readonly clientProfileRepository: Repository<ClientProfile>,
  ) {}

  async create(userId: string, dto: CreateProjectDto): Promise<Project> {
    const clientProfile = await this.clientProfileRepository.findOne({
      where: { userId },
    });

    if (!clientProfile) {
      throw new ForbiddenException(
        'É necessário ter um perfil de cliente para publicar projetos',
      );
    }

    const project = this.projectRepository.create({
      ...dto,
      clientProfileId: clientProfile.id,
    });

    return this.projectRepository.save(project);
  }

  async findAll(filters: ProjectFilterDto): Promise<PaginatedResult<Project>> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const qb = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.clientProfile', 'clientProfile')
      .leftJoinAndSelect('clientProfile.user', 'user')
      .leftJoinAndSelect('project.category', 'category')
      .leftJoinAndSelect('project.subcategory', 'subcategory')
      .where('project.status = :status', { status: ProjectStatus.ABERTO });

    if (filters.categoryId) {
      qb.andWhere('project.categoryId = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters.subcategoryId) {
      qb.andWhere('project.subcategoryId = :subcategoryId', {
        subcategoryId: filters.subcategoryId,
      });
    }

    if (filters.minBudget) {
      qb.andWhere('project.budget >= :minBudget', {
        minBudget: filters.minBudget,
      });
    }

    if (filters.maxBudget) {
      qb.andWhere('project.budget <= :maxBudget', {
        maxBudget: filters.maxBudget,
      });
    }

    if (filters.search) {
      qb.andWhere(
        '(project.title LIKE :search OR project.description LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    qb.orderBy('project.createdAt', 'DESC');

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: [
        'clientProfile',
        'clientProfile.user',
        'category',
        'subcategory',
        'proposals',
        'proposals.freelancerProfile',
        'proposals.freelancerProfile.user',
      ],
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    return project;
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.findOne(id);

    const clientProfile = await this.clientProfileRepository.findOne({
      where: { userId },
    });

    if (!clientProfile || project.clientProfileId !== clientProfile.id) {
      throw new ForbiddenException(
        'Não tem permissão para editar este projeto',
      );
    }

    if (project.status !== ProjectStatus.ABERTO) {
      throw new BadRequestException(
        'Apenas projetos abertos podem ser editados',
      );
    }

    Object.assign(project, dto);
    return this.projectRepository.save(project);
  }

  async cancel(userId: string, id: string): Promise<Project> {
    const project = await this.findOne(id);

    const clientProfile = await this.clientProfileRepository.findOne({
      where: { userId },
    });

    if (!clientProfile || project.clientProfileId !== clientProfile.id) {
      throw new ForbiddenException(
        'Não tem permissão para cancelar este projeto',
      );
    }

    // Verificar se há contrato ativo
    const hasActiveContract = project.proposals?.some(
      (p) => p.contract && p.contract.status === ContractStatus.ATIVO,
    );

    if (hasActiveContract) {
      throw new BadRequestException(
        'Não é possível cancelar um projeto com contrato ativo',
      );
    }

    project.status = ProjectStatus.CANCELADO;
    return this.projectRepository.save(project);
  }

  async findByClient(userId: string): Promise<Project[]> {
    const clientProfile = await this.clientProfileRepository.findOne({
      where: { userId },
    });

    if (!clientProfile) {
      return [];
    }

    return this.projectRepository.find({
      where: { clientProfileId: clientProfile.id },
      relations: ['category', 'subcategory'],
      order: { createdAt: 'DESC' },
    });
  }
}
