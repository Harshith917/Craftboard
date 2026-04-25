import { Module } from '@nestjs/common';
import { FrameNodesService } from './frame-nodes.service';
import { FrameNodesController } from './frame-nodes.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [FrameNodesService, PrismaService],
  controllers: [FrameNodesController],
})
export class FrameNodesModule {}
