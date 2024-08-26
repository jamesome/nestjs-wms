import { Injectable } from '@nestjs/common';
import { CreateItemSerialDto } from './dto/create-item-serial.dto';
import { UpdateItemSerialDto } from './dto/update-item-serial.dto';

@Injectable()
export class ItemSerialService {
  create(createItemSerialDto: CreateItemSerialDto) {
    return 'This action adds a new itemSerial' + createItemSerialDto;
  }

  findAll() {
    return `This action returns all itemSerial`;
  }

  findOne(id: number) {
    return `This action returns a #${id} itemSerial`;
  }

  update(id: number, updateItemSerialDto: UpdateItemSerialDto) {
    return `This action updates a #${id} itemSerial` + updateItemSerialDto;
  }

  remove(id: number) {
    return `This action removes a #${id} itemSerial`;
  }
}
