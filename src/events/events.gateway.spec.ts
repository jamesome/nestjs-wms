import { Test, TestingModule } from '@nestjs/testing';
import { EventsGateway } from './events.gateway';
import { Socket, Server } from 'socket.io';

describe('EventsGateway', () => {
  let gateway: EventsGateway;
  let mockServer: Partial<Server>;
  let mockSocket: Partial<Socket>;

  beforeEach(async () => {
    mockServer = {
      emit: jest.fn(),
    };

    mockSocket = {
      id: '1234',
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsGateway],
    }).compile();

    gateway = module.get<EventsGateway>(EventsGateway);
    gateway.server = mockServer as Server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should set client id', () => {
    gateway.handleEvent('1234', mockSocket as Socket);
    expect(gateway['clients'].get('1234')).toBe(mockSocket);
  });

  it('should emit event to correct client', () => {
    gateway.handleEvent('1234', mockSocket as Socket);
    gateway.handleEmit('1234', 'testEvent', {
      data: { total: 1, processed: 1 },
    });
    expect(mockSocket.emit).toHaveBeenCalledWith('testEvent', {
      payload: {
        data: { total: 1, processed: 1 },
      },
    });
  });

  it('should remove client on disconnect', () => {
    gateway.handleEvent('1234', mockSocket as Socket);
    gateway.handleDisconnect(mockSocket as Socket);
    expect(gateway['clients'].get('1234')).toBeUndefined();
  });
});
