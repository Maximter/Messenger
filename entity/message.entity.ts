import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id_message: number;

  @Column()
  id_chat: string;

  @Column()
  id_sender: number;

  @Column()
  content: string;

  @Column()
  message_sent: string;
}
