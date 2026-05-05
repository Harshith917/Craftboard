import { Injectable, UnauthorizedException } from '@nestjs/common';
import { WebhookHandler, WebhookEvent } from '@liveblocks/node';

@Injectable()
export class LiveblocksService {
  private webhookHandler: WebhookHandler;

  constructor() {
    this.webhookHandler = new WebhookHandler(
      process.env.LIVEBLOCKS_WEBHOOK_SECRET!,
    );
  }

  verifyWebhook(
    rawBody: Buffer,
    headers: Record<string, string>,
  ): WebhookEvent {
    try {
      return this.webhookHandler.verifyRequest({
        headers,
        rawBody: rawBody.toString(),
      });
    } catch {
      throw new UnauthorizedException('Invalid Liveblocks webhook signature');
    }
  }
  extractPageId(roomId: string): string | null {
    const match = roomId.match(/^page-(.+)$/);
    return match ? match[1] : null;
  }
}
