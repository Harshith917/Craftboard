import { Controller, Get, Post } from '@nestjs/common';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  getProjects() {
    return this.projectService.getProjects();
  }

  @Get(':id')
  getProjectById(id: string) {
    return this.projectService.getProjectById(id);
  }

  @Post()
  createProject(data: any) {
    return this.projectService.createProject(data);
  }
}
