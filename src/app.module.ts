import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoogleSheetsModule } from './google-sheets/google-sheets.module';
import { FirebaseService } from './libs/database/firebase.service';

@Module({
  imports: [ConfigModule.forRoot(), GoogleSheetsModule],
  controllers: [AppController],
  providers: [AppService, FirebaseService],
})
export class AppModule {}
