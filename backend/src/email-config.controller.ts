import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { EmailConfigService } from './email-config.service';
import { AuthGuard } from './auth.guard';

@Controller('email-config')
@UseGuards(AuthGuard)
export class EmailConfigController {
  constructor(private readonly emailConfigService: EmailConfigService) {}

  @Get()
  getConfig() {
    return this.emailConfigService.getConfig();
  }

  @Post()
  async saveConfig(@Body() data: any) {
    return this.emailConfigService.saveConfig(data);
  }

  @Post('test')
  async testSend(@Body() body: { to: string, subject: string, text?: string, html?: string }) {
    return this.emailConfigService.sendMail(body);
  }
} 