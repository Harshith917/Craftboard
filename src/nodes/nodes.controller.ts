import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClerkAuthGuard } from 'src/auth/clerk.guard';
import { NodesService } from './nodes.service';

@Controller('pages/:pageId/nodes')
@UseGuards(ClerkAuthGuard)
export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

  @Get()
  getNodes(@Param('pageId') pageId: string, @Req() req: any) {
    return this.nodesService.getNodes(pageId, req['userId']);
  }

  @Post()
  saveNodes(
    @Param('pageId') pageId: string,
    @Body() body: { nodes: any[] },
    @Req() req: any,
  ) {
    return this.nodesService.saveNodes(pageId, body.nodes, req['userId']);
  }

  @Patch()
  patchNodes(
    @Param('pageId') pageId: string,
    @Body() body: { upserts: any[]; deletes: string[] },
    @Req() req: any,
  ) {
    return this.nodesService.patchNodes(pageId, body, req['userId']);
  }
}
