import { OnEvent } from '@nestjs/event-emitter';
import { TransactionEvent } from '../events/transaction.event';
import { EventsGateway } from 'src/events/events.gateway';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TransactionListener {
  constructor(private readonly eventsGateway: EventsGateway) {}

  @OnEvent('transaction.*')
  handleOrderCreatedEvent(payload: TransactionEvent) {
    this.eventsGateway.handleEmit(payload.id, payload.name, {
      total: payload.total,
      processed: payload.processed,
    });
  }
}
