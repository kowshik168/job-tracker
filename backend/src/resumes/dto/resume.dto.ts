import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ResumeType } from '@prisma/client';

export class UpdateResumeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsEnum(ResumeType)
  resumeType?: ResumeType;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}

export class CreateResumeLearningDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;

  @IsOptional()
  @IsString()
  applicationId?: string;
}
