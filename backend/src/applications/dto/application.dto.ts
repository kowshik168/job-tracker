import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUrl,
  IsDateString,
  MaxLength,
} from 'class-validator';
import {
  ApplicationStatus,
  CurrentRound,
  ResumeType,
  Source,
} from '@prisma/client';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  company!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  role!: string;

  @IsOptional()
  @IsUrl({}, { message: 'jobUrl must be a valid URL' })
  jobUrl?: string;

  @IsDateString()
  appliedAt!: string;

  @IsOptional()
  @IsEnum(Source)
  source?: Source;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  referral?: string;

  @IsOptional()
  @IsString()
  resumeId?: string;

  @IsEnum(ResumeType)
  resumeType!: ResumeType;

  @IsEnum(ApplicationStatus)
  status!: ApplicationStatus;

  @IsOptional()
  @IsEnum(CurrentRound)
  currentRound?: CurrentRound;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  recruiterName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  recruiterContact?: string;

  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}

export class UpdateApplicationDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  company?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  role?: string;

  @IsOptional()
  @IsUrl({}, { message: 'jobUrl must be a valid URL' })
  jobUrl?: string;

  @IsOptional()
  @IsDateString()
  appliedAt?: string;

  @IsOptional()
  @IsEnum(Source)
  source?: Source;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  referral?: string;

  @IsOptional()
  @IsString()
  resumeId?: string | null;

  @IsOptional()
  @IsEnum(ResumeType)
  resumeType?: ResumeType;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsEnum(CurrentRound)
  currentRound?: CurrentRound;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  recruiterName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  recruiterContact?: string;

  @IsOptional()
  @IsDateString()
  followUpDate?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
