import { ConfigService } from '@nestjs/config';

export interface OdooConfig {
  apiKey: string;
  database: string;
  url: string;
}

export function getOdooConfig(configService: ConfigService): OdooConfig | null {
  const apiKey = configService.get<string>('ODOO_API_KEY');
  const database = configService.get<string>('ODOO_DATABASE');
  const rawUrl = configService.get<string>('ODOO_URL');

  if (!apiKey || !database || !rawUrl) {
    return null;
  }

  return {
    apiKey,
    database,
    url: rawUrl.replace(/\/+$/, ''),
  };
}
