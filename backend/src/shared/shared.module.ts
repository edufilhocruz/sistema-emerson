import { Module } from '@nestjs/common';
import { TemplateEngineService } from './services/template-engine.service';
import { EmailTemplateService } from './services/email-template.service';
import { FileManagerService } from './services/file-manager.service';
import { ImagePreviewService } from './services/image-preview.service';
import { TemplateDemoController } from './controllers/template-demo.controller';

@Module({
  controllers: [TemplateDemoController],
  providers: [
    TemplateEngineService,
    EmailTemplateService,
    FileManagerService,
    ImagePreviewService,
  ],
  exports: [
    TemplateEngineService,
    EmailTemplateService,
    FileManagerService,
    ImagePreviewService,
  ],
})
export class SharedModule {}
