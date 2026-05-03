import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './project/project.module';
import { PageModule } from './page/page.module';
import { UsersModule } from './users/users.module';
import { NodesModule } from './nodes/nodes.module';

@Module({
  imports: [PrismaModule, ProjectModule, PageModule, UsersModule, NodesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
