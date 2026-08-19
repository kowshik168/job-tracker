import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ResumeType } from '@prisma/client';
import { ResumesService } from './resumes.service';
import { CreateResumeLearningDto, UpdateResumeDto } from './dto/resume.dto';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Get()
  findAll() {
    return this.resumesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Get(':id/file')
  async download(@Param('id') id: string) {
    const file = await this.resumesService.getFile(id);
    return {
      fileName: file.fileName,
      mimeType: file.mimeType,
      data: Buffer.from(file.data).toString('base64'),
    };
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  create(
    @UploadedFile() file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
    @Body()
    body: { name?: string; resumeType?: ResumeType; notes?: string },
  ) {
    return this.resumesService.create({
      name: body.name || file?.originalname || 'Untitled resume',
      resumeType: body.resumeType ?? ResumeType.GENERAL_SWE,
      notes: body.notes,
      file,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateResumeDto) {
    return this.resumesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resumesService.remove(id);
  }

  @Post(':id/learnings')
  addLearning(
    @Param('id') id: string,
    @Body() dto: CreateResumeLearningDto,
  ) {
    return this.resumesService.addLearning(id, dto);
  }

  @Delete(':id/learnings/:learningId')
  removeLearning(
    @Param('id') id: string,
    @Param('learningId') learningId: string,
  ) {
    return this.resumesService.removeLearning(id, learningId);
  }
}
