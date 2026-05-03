import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { ClerkAuthGuard } from 'src/auth/clerk.guard';

@Controller('project')
@UseGuards(ClerkAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  getProjects(
    @Req() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '9',
    @Query('search') search = '',
  ) {
    return this.projectService.getProjects({
      ownerId: req['userId'],
      page: parseInt(page),
      limit: parseInt(limit),
      search,
    });
  }

  @Get(':id')
  getProjectById(@Param('id') id: string, @Req() req: any) {
    return this.projectService.getProjectById(id, req['userId']);
  }

  @Post()
  createProject(@Body() data: any, @Req() req: any) {
    return this.projectService.createProject(data, req['userId']);
  }
}
