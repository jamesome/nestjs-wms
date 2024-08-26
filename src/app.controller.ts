import { Controller, Get, Render } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@Controller()
@ApiExcludeController()
export class AppController {
  @Get()
  @Render('index')
  root(): object {
    return { message: 'Sellmate WMS API' };
  }
}
