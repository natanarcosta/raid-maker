import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleSheetsModule } from './google-sheets/google-sheets.module';

@Module({
  imports: [ConfigModule.forRoot(), GoogleSheetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
