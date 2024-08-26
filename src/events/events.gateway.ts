import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayDisconnect {
  private clients: Map<string, Socket> = new Map();

  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('greeting')
  handleEvent(
    @MessageBody('id') id: string,
    @ConnectedSocket() client: Socket,
  ): void {
    console.log(`Set Client. ${id}`);
    this.clients.set(id, client);
  }

  handleEmit(id: string, name: string, payload: any) {
    const client = this.clients.get(id);

    console.log(`Find Client. ${id}`);
    if (client) {
      console.log(`Successfully found client. ${id}`);
      client.emit(name, { payload });
    }
  }

  handleDisconnect(client: Socket) {
    const clientId = [...this.clients.entries()].find(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, socket]) => socket === client,
    )?.[0];
    if (clientId) {
      this.clients.delete(clientId);
      console.log(`Socket Disconnected Successfully. ${clientId}`);
    }
  }
}
