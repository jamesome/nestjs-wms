import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ShopService } from './shop.service';

@Controller('shops')
@ApiTags('Shop API')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get()
  async findAll() {
    return await this.shopService.findAll();
  }
}
