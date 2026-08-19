import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
} from './dto/application.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';

const resumeSelect = {
  id: true,
  name: true,
  resumeType: true,
  fileName: true,
  fileSize: true,
} as const;

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveResume(resumeId?: string | null) {
    if (!resumeId) return null;
    const resume = await this.prisma.resume.findUnique({
      where: { id: resumeId },
    });
    if (!resume) {
      throw new BadRequestException('Selected resume was not found');
    }
    return resume;
  }

  async findAll(query: QueryApplicationsDto) {
    const {
      search,
      status,
      resumeType,
      source,
      sortBy = 'appliedAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = query;

    const where: Prisma.ApplicationWhereInput = {};

    if (search) {
      where.OR = [
        { company: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (resumeType) where.resumeType = resumeType;
    if (source) where.source = source;

    const orderBy: Prisma.ApplicationOrderByWithRelationInput =
      sortBy === 'followUpDate'
        ? { followUpDate: sortOrder }
        : { appliedAt: sortOrder };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: { resume: { select: resumeSelect } },
      }),
      this.prisma.application.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { resume: { select: resumeSelect } },
    });

    if (!application) {
      throw new NotFoundException(`Application with id "${id}" not found`);
    }

    return application;
  }

  async create(dto: CreateApplicationDto) {
    const resume = await this.resolveResume(dto.resumeId);

    return this.prisma.application.create({
      data: {
        company: dto.company,
        role: dto.role,
        jobUrl: dto.jobUrl,
        appliedAt: new Date(dto.appliedAt),
        source: dto.source,
        referral: dto.referral,
        resumeType: resume?.resumeType ?? dto.resumeType,
        resumeId: resume?.id,
        status: dto.status,
        currentRound: dto.currentRound ?? 'NONE',
        recruiterName: dto.recruiterName,
        recruiterContact: dto.recruiterContact,
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : null,
        notes: dto.notes,
        lastActivityAt: new Date(),
      },
      include: { resume: { select: resumeSelect } },
    });
  }

  async update(id: string, dto: UpdateApplicationDto) {
    await this.findOne(id);

    const data: Prisma.ApplicationUpdateInput = {};

    if (dto.company !== undefined) data.company = dto.company;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.jobUrl !== undefined) data.jobUrl = dto.jobUrl;
    if (dto.appliedAt !== undefined) data.appliedAt = new Date(dto.appliedAt);
    if (dto.source !== undefined) data.source = dto.source;
    if (dto.referral !== undefined) data.referral = dto.referral;
    if (dto.resumeType !== undefined) data.resumeType = dto.resumeType;
    if (dto.resumeId !== undefined) {
      if (dto.resumeId === null || dto.resumeId === '') {
        data.resume = { disconnect: true };
      } else {
        const resume = await this.resolveResume(dto.resumeId);
        data.resume = { connect: { id: resume!.id } };
        data.resumeType = resume!.resumeType;
      }
    }
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.currentRound !== undefined) data.currentRound = dto.currentRound;
    if (dto.recruiterName !== undefined) data.recruiterName = dto.recruiterName;
    if (dto.recruiterContact !== undefined)
      data.recruiterContact = dto.recruiterContact;
    if (dto.followUpDate !== undefined) {
      data.followUpDate =
        dto.followUpDate === null ? null : new Date(dto.followUpDate);
    }
    if (dto.notes !== undefined) data.notes = dto.notes;

    if (dto.noResponse === true) {
      data.noResponseAt = new Date();
    } else if (dto.noResponse === false) {
      data.noResponseAt = null;
      data.lastActivityAt = new Date();
    }

    const touchesActivity =
      dto.company !== undefined ||
      dto.role !== undefined ||
      dto.status !== undefined ||
      dto.currentRound !== undefined ||
      dto.appliedAt !== undefined ||
      dto.notes !== undefined ||
      dto.resumeId !== undefined ||
      dto.resumeType !== undefined ||
      dto.source !== undefined ||
      dto.followUpDate !== undefined;

    if (touchesActivity) {
      data.lastActivityAt = new Date();
      if (dto.status !== undefined) {
        data.noResponseAt = null;
      }
    }

    return this.prisma.application.update({
      where: { id },
      data,
      include: { resume: { select: resumeSelect } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.application.delete({ where: { id } });
    return { message: 'Application deleted successfully' };
  }
}
