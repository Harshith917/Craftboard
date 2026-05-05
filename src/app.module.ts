import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { PageModule } from './page/page.module';
import { UsersModule } from './users/users.module';
import { NodesModule } from './nodes/nodes.module';
import { LiveblocksService } from './liveblocks/liveblocks.service';
import { LiveblocksModule } from './liveblocks/liveblocks.module';

@Module({
  imports: [PrismaModule, ProjectModule, PageModule, UsersModule, NodesModule, LiveblocksModule],
  controllers: [AppController],
  providers: [AppService, LiveblocksService],
})
export class AppModule {}
