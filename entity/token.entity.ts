import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Token extends BaseEntity {
  @PrimaryGeneratedColumn()
  id_token: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ unique: true, length: 65 })
  token: string;
} 
