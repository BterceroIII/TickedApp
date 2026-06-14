import { Module } from '@nestjs/common';
import { OdooService } from './services/odoo.service';

@Module({
  providers: [OdooService],
  exports: [OdooService],
})
export class CommonModule {}
