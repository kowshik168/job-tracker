import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateApplicationDto,
  UpdateApplicationDto,
} from './dto/application.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

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
    });

    if (!application) {
      throw new NotFoundException(`Application with id "${id}" not found`);
    }

    return application;
  }

  async create(dto: CreateApplicationDto) {
    return this.prisma.application.create({
      data: {
        company: dto.company,
        role: dto.role,
        jobUrl: dto.jobUrl,
        appliedAt: new Date(dto.appliedAt),
        source: dto.source,
        referral: dto.referral,
        resumeType: dto.resumeType,
        status: dto.status,
        currentRound: dto.currentRound ?? 'NONE',
        recruiterName: dto.recruiterName,
        recruiterContact: dto.recruiterContact,
        followUpDate: dto.followUpDate ? new Date(dto.followUpDate) : null,
        notes: dto.notes,
      },
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

    return this.prisma.application.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.application.delete({ where: { id } });
    return { message: 'Application deleted successfully' };
  }
}
