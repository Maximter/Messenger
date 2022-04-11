import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    BaseEntity,
    OneToOne,
    JoinColumn,
    PrimaryColumn,
  } from 'typeorm';
import { Chat } from './chat.entity';
  import { User } from './user.entity';
  
  @Entity()
  export class ChatInfo extends BaseEntity {
    @PrimaryGeneratedColumn()
    id_chat_info: number;
  
    @Column()
    chat: string;

    @Column()
    last_message_content : string;

    @Column()
    last_message_time : string;

    @Column()
    last_message_sender : number;
  } 
  