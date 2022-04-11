import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    OneToOne,
    JoinColumn,
    PrimaryColumn,
    ManyToOne,
  } from 'typeorm';
  import { User } from './user.entity';
  
  @Entity()
  export class Chat extends BaseEntity {
    @PrimaryGeneratedColumn()
    PK_id_chat: number;

    @Column({ length : 65 })
    chat_id : string;
  
    @OneToOne(() => User)
    @JoinColumn()
    member: User;

    @Column({ default : 0 })
    unread : number;
  } 
  