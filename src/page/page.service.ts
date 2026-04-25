import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PageService {
  constructor(private readonly prisma: PrismaService) {}

  createPage(data: any) {
    return this.prisma.page.create({ data });
  }

  getPages() {
    return this.prisma.page.findMany();
  }
  getPageById(id: string) {
    return this.prisma.page.findUnique({
      where: { id },
    });
  }
}
