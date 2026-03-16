import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { ProjectStatus } from '../../common/enums/project-status.enum.js';
import { ClientProfile } from '../../profiles/entities/client-profile.entity.js';
import { Category } from '../../categories/entities/category.entity.js';
import { Proposal } from '../../proposals/entities/proposal.entity.js';
import { GenericEntity } from '../../generic/entities/generic.entity.js';

@Entity('projects')
export class Project extends GenericEntity {
  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  budget: number;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.ABERTO,
  })
  status: ProjectStatus;

  @Column({ type: 'simple-array', nullable: true })
  skills: string[];

  @ManyToOne(() => ClientProfile, (client) => client.projects, {
    onDelete: 'CASCADE',
  })
  clientProfile: ClientProfile;

  @Column('uuid')
  clientProfileId: string;

  @ManyToOne(() => Category, (category) => category.projects, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  subcategory: Category;

  @Column({ type: 'uuid', nullable: true })
  subcategoryId: string;

  @OneToMany(() => Proposal, (proposal) => proposal.project)
  proposals: Proposal[];
}
