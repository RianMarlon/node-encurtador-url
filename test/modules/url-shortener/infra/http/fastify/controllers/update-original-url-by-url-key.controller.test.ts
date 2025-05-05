import 'reflect-metadata';
import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { UpdateOriginalUrlByUrlKeyController } from '@/modules/url-shortener/infra/http/fastify/controllers/update-original-url-by-url-key.controller';
import { UpdateOriginalUrlByUrlKeyUseCase } from '@/modules/url-shortener/application/usecases/update-original-url-by-url-key/update-original-url-by-url-key.usecase';

jest.mock(
  '@/modules/url-shortener/application/usecases/update-original-url-by-url-key/update-original-url-by-url-key.usecase',
);

describe('UpdateOriginalUrlByUrlKeyController', () => {
  let updateOriginalUrlByUrlKeyController: UpdateOriginalUrlByUrlKeyController;
  let mockUpdateOriginalUrlByUrlKeyUseCase: jest.Mocked<UpdateOriginalUrlByUrlKeyUseCase>;

  const urlKey = 'abc123';
  const originalUrl = 'https://example.com/updated-url';
  const userId = 'user-123';

  const mockRequest = {
    params: {
      urlKey,
    },
    body: {
      originalUrl,
    },
    user: {
      id: userId,
    },
  } as unknown as FastifyRequest;

  const mockReply = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUpdateOriginalUrlByUrlKeyUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<UpdateOriginalUrlByUrlKeyUseCase>;

    jest.spyOn(container, 'resolve').mockReturnValue(mockUpdateOriginalUrlByUrlKeyUseCase);

    updateOriginalUrlByUrlKeyController = new UpdateOriginalUrlByUrlKeyController();
  });

  it('should update the original URL and return 200 status code', async () => {
    const mockResult = {
      urlKey: 'abc123',
      shortUrl: 'http://short.url/abc123',
      originalUrl: 'https://example.com/updated-url',
      clickCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUpdateOriginalUrlByUrlKeyUseCase.execute.mockResolvedValueOnce(mockResult);

    await updateOriginalUrlByUrlKeyController.handle(mockRequest, mockReply);

    expect(container.resolve).toHaveBeenCalledWith(UpdateOriginalUrlByUrlKeyUseCase);
    expect(mockUpdateOriginalUrlByUrlKeyUseCase.execute).toHaveBeenCalledWith({
      urlKey,
      originalUrl,
      userId,
    });

    expect(mockReply.status).toHaveBeenCalledWith(200);
    expect(mockReply.send).toHaveBeenCalledWith(mockResult);
  });

  it('should propagate errors from the use case', async () => {
    const mockError = new Error('Test error');
    mockUpdateOriginalUrlByUrlKeyUseCase.execute.mockRejectedValueOnce(mockError);

    await expect(
      updateOriginalUrlByUrlKeyController.handle(mockRequest, mockReply),
    ).rejects.toThrow('Test error');

    expect(mockUpdateOriginalUrlByUrlKeyUseCase.execute).toHaveBeenCalledWith({
      urlKey,
      originalUrl,
      userId,
    });

    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should use the user ID from the request', async () => {
    const customUserId = 'custom-user-123';
    const customRequest = {
      ...mockRequest,
      user: { id: customUserId },
    } as unknown as FastifyRequest;

    const mockResult = {
      urlKey: 'abc123',
      shortUrl: 'http://short.url/abc123',
      originalUrl: 'https://example.com/updated-url',
      clickCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUpdateOriginalUrlByUrlKeyUseCase.execute.mockResolvedValueOnce(mockResult);

    await updateOriginalUrlByUrlKeyController.handle(customRequest, mockReply);

    expect(mockUpdateOriginalUrlByUrlKeyUseCase.execute).toHaveBeenCalledWith({
      urlKey,
      originalUrl,
      userId: customUserId,
    });
  });
});
