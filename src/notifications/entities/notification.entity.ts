import { Entity, Column, ManyToOne } from 'typeorm';
import { NotificationType } from '../../common/enums/notification-type.enum.js';
import { User } from '../../users/entities/user.entity.js';
import { GenericEntity } from '../../generic/entities/generic.entity.js';

@Entity('notifications')
export class Notification extends GenericEntity {
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column('uuid')
  userId: string;
}
