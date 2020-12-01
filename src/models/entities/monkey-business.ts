import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { Expose } from 'class-transformer';
import {
  IsUUID,
  IsDateString,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';

@Entity({ name: 'monkey_business' })
export class MonkeyBusiness {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  @IsOptional()
  public id!: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @Column()
  public biz!: string;

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
