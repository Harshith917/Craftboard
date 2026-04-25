import { Test, TestingModule } from '@nestjs/testing';
import { FrameNodesService } from './frame-nodes.service';

describe('FrameNodesService', () => {
  let service: FrameNodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FrameNodesService],
    }).compile();

    service = module.get<FrameNodesService>(FrameNodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
