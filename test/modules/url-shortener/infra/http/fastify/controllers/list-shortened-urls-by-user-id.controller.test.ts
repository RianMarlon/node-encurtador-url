import 'reflect-metadata';
import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { ListShortenedUrlsByUserIdController } from '@/modules/url-shortener/infra/http/fastify/controllers/list-shortened-urls-by-user-id.controller';
import { ListShortenedUrlsByUserIdUseCase } from '@/modules/url-shortener/application/usecases/list-shortened-urls-by-user-id/list-shortened-urls-by-user-id.usecase';

jest.mock(
  '@/modules/url-shortener/application/usecases/list-shortened-urls-by-user-id/list-shortened-urls-by-user-id.usecase',
);

describe('ListShortenedUrlsByUserIdController', () => {
  let listShortenedUrlsByUserIdController: ListShortenedUrlsByUserIdController;
  let mockListShortenedUrlsByUserIdUseCase: jest.Mocked<ListShortenedUrlsByUserIdUseCase>;

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

    jest.spyOn(container, 'resolve').mockReturnValue(mockListShortenedUrlsByUserIdUseCase);

    listShortenedUrlsByUserIdController = new ListShortenedUrlsByUserIdController();
  });

  it('should return 200 status code with user URLs', async () => {
    // Arrange
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

    // Act
    await listShortenedUrlsByUserIdController.handle(mockRequest, mockReply);

    // Assert
    expect(container.resolve).toHaveBeenCalledWith(ListShortenedUrlsByUserIdUseCase);
    expect(mockListShortenedUrlsByUserIdUseCase.execute).toHaveBeenCalledWith({
      userId: 'user-123',
    });
    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith(mockResult);
  });

  it('should throw error when user is not authenticated', async () => {
    // Arrange
    const unauthenticatedRequest = {
      user: undefined,
    } as unknown as FastifyRequest;

    // Act & Assert
    await expect(
      listShortenedUrlsByUserIdController.handle(unauthenticatedRequest, mockReply),
    ).rejects.toThrow();
    expect(mockListShortenedUrlsByUserIdUseCase.execute).not.toHaveBeenCalled();
  });

  it('should propagate errors from the use case', async () => {
    // Arrange
    const mockError = new Error('Test error');
    mockListShortenedUrlsByUserIdUseCase.execute.mockRejectedValueOnce(mockError);

    // Act & Assert
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
