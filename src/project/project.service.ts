import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async createProject(data: any) {
    return this.prisma.project.create({
      data,
    });
  }

  async getProjects() {
    return this.prisma.project.findMany();
  }

  async getProjectById(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
    });
  }
}
