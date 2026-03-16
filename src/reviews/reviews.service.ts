import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity.js';
import { Contract } from '../contracts/entities/contract.entity.js';
import { Notification } from '../notifications/entities/notification.entity.js';
import { CreateReviewDto } from './dto/review.dto.js';
import { ContractStatus } from '../common/enums/contract-status.enum.js';
import { NotificationType } from '../common/enums/notification-type.enum.js';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async create(userId: string, dto: CreateReviewDto): Promise<Review> {
    const contract = await this.contractRepository.findOne({
      where: { id: dto.contractId },
      relations: [
        'clientProfile',
        'clientProfile.user',
        'freelancerProfile',
        'freelancerProfile.user',
        'project',
      ],
    });

    if (!contract) {
      throw new NotFoundException('Contrato não encontrado');
    }

    if (contract.status !== ContractStatus.CONCLUIDO) {
      throw new BadRequestException(
        'Avaliações só podem ser criadas após o contrato ser concluído',
      );
    }

    // Determinar quem está a avaliar e quem é o avaliado
    const isClient = contract.clientProfile.userId === userId;
    const isFreelancer = contract.freelancerProfile.userId === userId;

    if (!isClient && !isFreelancer) {
      throw new ForbiddenException(
        'Não tem permissão para avaliar este contrato',
      );
    }

    const reviewerType = isClient ? 'client' : 'freelancer';
    const reviewedId = isClient
      ? contract.freelancerProfile.userId
      : contract.clientProfile.userId;

    // Verificar se já avaliou este contrato
    const existingReview = await this.reviewRepository.findOne({
      where: {
        contractId: contract.id,
        reviewerId: userId,
      },
    });

    if (existingReview) {
      throw new ConflictException('Já avaliou este contrato');
    }

    const review = this.reviewRepository.create({
      rating: dto.rating,
      comment: dto.comment,
      reviewerType,
      contractId: contract.id,
      reviewerId: userId,
      reviewedId,
    });

    const savedReview = await this.reviewRepository.save(review);

    // Notificar o avaliado
    await this.notificationRepository.save(
      this.notificationRepository.create({
        userId: reviewedId,
        type: NotificationType.NOVA_AVALIACAO,
        message: `Recebeu uma nova avaliação de ${dto.rating} estrelas no projeto "${contract.project.title}"`,
      }),
    );

    return savedReview;
  }

  async findByFreelancer(freelancerUserId: string) {
    const reviews = await this.reviewRepository.find({
      where: { reviewedId: freelancerUserId, reviewerType: 'client' },
      relations: ['reviewer', 'contract', 'contract.project'],
      order: { createdAt: 'DESC' },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
      reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    };
  }

  async findByClient(clientUserId: string) {
    const reviews = await this.reviewRepository.find({
      where: { reviewedId: clientUserId, reviewerType: 'freelancer' },
      relations: ['reviewer', 'contract', 'contract.project'],
      order: { createdAt: 'DESC' },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
      reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    };
  }
}
