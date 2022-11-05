import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService, TemplateData } from './app.service';
import {
  FirebaseService,
  MockUserModel,
} from './libs/database/firebase.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly firebaseService: FirebaseService,
  ) {}

  @Get('raid')
  getRaidParties() {
    return this.appService.createRaid();
  }

  @Post('/images')
  async createImages(@Body() body: TemplateData[]) {
    return await this.appService.createImages(body);
  }

  @Post('/firebase/user')
  createUser(@Body() body: MockUserModel) {
    return this.firebaseService.write(body);
  }

  @Get('/firebase')
  async getAll() {
    return await this.firebaseService.read();
  }

  @Get('/firebase/:id')
  async getOneById(@Param('id') id: string) {
    return await this.firebaseService.getOneById(id);
  }
}
