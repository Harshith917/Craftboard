import { CreateNodeDto } from './dto/create-frame-nodes';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FrameNodesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllFrameNodes() {
    return this.prisma.node.findMany();
  }

  async createFrameNode(CreateNodeDto: CreateNodeDto) {
    return this.prisma.node.create({
      data: CreateNodeDto,
    });
  }
}
