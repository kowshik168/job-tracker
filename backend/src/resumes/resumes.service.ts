import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ResumeType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResumeLearningDto, UpdateResumeDto } from './dto/resume.dto';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const resumeListSelect = {
  id: true,
  name: true,
  resumeType: true,
  fileName: true,
  mimeType: true,
  fileSize: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: { applications: true, learnings: true },
  },
} as const;

@Injectable()
export class ResumesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.resume.findMany({
      select: resumeListSelect,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
      select: {
        ...resumeListSelect,
        applications: {
          select: {
            id: true,
            company: true,
            role: true,
            status: true,
            appliedAt: true,
          },
          orderBy: { appliedAt: 'desc' },
        },
        learnings: {
          include: {
            application: {
              select: { id: true, company: true, role: true, status: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    return resume;
  }

  async create(params: {
    name: string;
    resumeType: ResumeType;
    notes?: string;
    file: { originalname: string; mimetype: string; size: number; buffer: Buffer };
  }) {
    const { file } = params;

    if (!file) {
      throw new BadRequestException('Please attach a resume file');
    }

    if (file.size > MAX_FILE_BYTES) {
      throw new BadRequestException('Resume must be 5 MB or smaller');
    }

    if (!ALLOWED_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Upload a PDF or Word document');
    }

    return this.prisma.resume.create({
      data: {
        name: params.name.trim(),
        resumeType: params.resumeType,
        notes: params.notes?.trim() || null,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        data: Buffer.from(file.buffer),
      },
      select: resumeListSelect,
    });
  }

  async update(id: string, dto: UpdateResumeDto) {
    await this.findOne(id);
    return this.prisma.resume.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        resumeType: dto.resumeType,
        notes: dto.notes,
      },
      select: resumeListSelect,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.resume.delete({ where: { id } });
    return { message: 'Resume deleted' };
  }

  async getFile(id: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
      select: { fileName: true, mimeType: true, data: true },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    return resume;
  }

  async addLearning(resumeId: string, dto: CreateResumeLearningDto) {
    await this.findOne(resumeId);

    if (dto.applicationId) {
      const application = await this.prisma.application.findUnique({
        where: { id: dto.applicationId },
      });
      if (!application) {
        throw new BadRequestException('Application not found');
      }
    }

    return this.prisma.resumeLearning.create({
      data: {
        resumeId,
        content: dto.content.trim(),
        applicationId: dto.applicationId || null,
      },
      include: {
        application: {
          select: { id: true, company: true, role: true, status: true },
        },
      },
    });
  }

  async removeLearning(resumeId: string, learningId: string) {
    const learning = await this.prisma.resumeLearning.findFirst({
      where: { id: learningId, resumeId },
    });

    if (!learning) {
      throw new NotFoundException('Learning not found');
    }

    await this.prisma.resumeLearning.delete({ where: { id: learningId } });
    return { message: 'Learning deleted' };
  }
}
