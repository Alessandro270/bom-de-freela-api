import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { Project } from '../../projects/entities/project.entity.js';
import { GenericEntity } from '../../generic/entities/generic.entity.js';

@Entity('categories')
export class Category extends GenericEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  parent: Category;

  @Column({ type: 'uuid', nullable: true })
  parentId: string;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToMany(() => Project, (project) => project.category)
  projects: Project[];
}
