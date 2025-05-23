import 'reflect-metadata';
import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { ListShortenedUrlsByUserIdController } from '@/modules/url-shortener/infra/http/fastify/controllers/list-shortened-urls-by-user-id.controller';
import { ListShortenedUrlsByUserIdUseCase } from '@/modules/url-shortener/application/usecases/list-shortened-urls-by-user-id/list-shortened-urls-by-user-id.usecase';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

jest.mock(
  '@/modules/url-shortener/application/usecases/list-shortened-urls-by-user-id/list-shortened-urls-by-user-id.usecase',
);

describe('ListShortenedUrlsByUserIdController', () => {
  let listShortenedUrlsByUserIdController: ListShortenedUrlsByUserIdController;
  let mockListShortenedUrlsByUserIdUseCase: jest.Mocked<ListShortenedUrlsByUserIdUseCase>;
  let mockLoggerProvider: jest.Mocked<LoggerProvider>;

  const mockRequest = {
    user: {
      id: 'user-123',
    },
  } as unknown as FastifyRequest;

  const mockReply = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    jest.clearAllMocks();

    mockListShortenedUrlsByUserIdUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ListShortenedUrlsByUserIdUseCase>;

    mockLoggerProvider = {
      debug: jest.fn(),
    } as unknown as jest.Mocked<LoggerProvider>;

    container.registerInstance('LoggerProvider', mockLoggerProvider);
    container.registerInstance(
      ListShortenedUrlsByUserIdUseCase,
      mockListShortenedUrlsByUserIdUseCase,
    );

    listShortenedUrlsByUserIdController = new ListShortenedUrlsByUserIdController();
  });

  it('should return 200 status code with user URLs', async () => {
    const mockDate = new Date();
    const mockResult = {
      data: [
        {
          urlKey: 'abc123',
          shortUrl: 'http://short.url/abc123',
          originalUrl: 'https://example.com/1',
          clickCount: 5,
          createdAt: mockDate,
          updatedAt: mockDate,
        },
        {
          urlKey: 'def456',
          shortUrl: 'http://short.url/def456',
          originalUrl: 'https://example.com/2',
          clickCount: 10,
          createdAt: mockDate,
          updatedAt: mockDate,
        },
      ],
    };

    mockListShortenedUrlsByUserIdUseCase.execute.mockResolvedValueOnce(mockResult);

    await listShortenedUrlsByUserIdController.handle(mockRequest, mockReply);

    expect(mockListShortenedUrlsByUserIdUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-123',
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith(mockResult);
  });

  it('should throw error when user is not authenticated', async () => {
    const unauthenticatedRequest = {
      user: undefined,
    } as unknown as FastifyRequest;

    await expect(
      listShortenedUrlsByUserIdController.handle(unauthenticatedRequest, mockReply),
    ).rejects.toThrow();
    expect(mockListShortenedUrlsByUserIdUseCase.execute).not.toHaveBeenCalled();
  });

  it('should propagate errors from the use case', async () => {
    const mockError = new Error('Test error');
    mockListShortenedUrlsByUserIdUseCase.execute.mockRejectedValueOnce(mockError);

    await expect(
      listShortenedUrlsByUserIdController.handle(mockRequest, mockReply),
    ).rejects.toThrow('Test error');
    expect(mockListShortenedUrlsByUserIdUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-123',
    });
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
