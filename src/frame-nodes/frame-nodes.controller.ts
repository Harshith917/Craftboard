import { Body, Controller, Get, Post } from '@nestjs/common';
import { FrameNodesService } from './frame-nodes.service';
import { CreateNodeDto } from './dto/create-frame-nodes';

@Controller('frame-nodes')
export class FrameNodesController {
  constructor(private readonly frameNodesService: FrameNodesService) {}

  @Get('getList')
  async getAllFrameNodes() {
    return this.frameNodesService.getAllFrameNodes();
  }

  @Post('create')
  async createFrameNode(@Body() CreateNodeDto: CreateNodeDto) {
    return this.frameNodesService.createFrameNode(CreateNodeDto);
  }
}
