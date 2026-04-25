import { Test, TestingModule } from '@nestjs/testing';
import { FrameNodesController } from './frame-nodes.controller';

describe('FrameNodesController', () => {
  let controller: FrameNodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FrameNodesController],
    }).compile();

    controller = module.get<FrameNodesController>(FrameNodesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
