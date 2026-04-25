import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FrameNodesModule } from './frame-nodes/frame-nodes.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { PageModule } from './page/page.module';

@Module({
  imports: [FrameNodesModule, PrismaModule, ProjectModule, PageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
