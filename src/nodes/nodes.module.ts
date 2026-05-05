import { Module } from '@nestjs/common';
import { NodesController } from './nodes.controller';
import { NodesService } from './nodes.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LiveblocksService } from 'src/liveblocks/liveblocks.service';

@Module({
  controllers: [NodesController],
  providers: [NodesService, PrismaService, LiveblocksService],
})
export class NodesModule {}
