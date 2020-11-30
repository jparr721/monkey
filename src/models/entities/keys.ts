import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';

@Entity({ name: 'keys' })
export class Keys {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  @IsOptional()
  public id!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @Column()
  public key!: string;

  @Expose()
  @IsDateString()
  @IsOptional()
  @CreateDateColumn()
  public createdAt?: Date;

  @Expose()
  @IsDateString()
  @IsOptional()
  @UpdateDateColumn()
  public updatedAt?: Date;
}
