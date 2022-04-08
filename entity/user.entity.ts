import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id_user: number;

  @Column({ unique: true, length: 45 })
  email: string;

  @Column({ length: 30 })
  name: string;

  @Column({ length: 30 })
  lastname: string;

  @Column({ length: 65 })
  password: string;

  @Column({ unique: true, length: 7 })
  findCode: string;

  @Column({ default : 1 })
  online: string;

  avatar ? : number | string; 
}
