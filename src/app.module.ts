import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FrameNodesModule } from './frame-nodes/frame-nodes.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [FrameNodesModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
