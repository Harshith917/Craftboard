import { Controller, Get, Post } from '@nestjs/common';
import { PageService } from './page.service';

@Controller('page')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get()
  getPages() {
    return this.pageService.getPages();
  }

  @Get(':id')
  getPageById(id: string) {
    return this.pageService.getPageById(id);
  }

  @Post()
  createPage(data: any) {
    return this.pageService.createPage(data);
  }
}
