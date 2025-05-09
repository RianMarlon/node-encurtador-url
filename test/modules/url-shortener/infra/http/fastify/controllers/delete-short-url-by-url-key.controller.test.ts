import 'reflect-metadata';
import { FastifyReply, FastifyRequest } from 'fastify';
import { container } from 'tsyringe';

import { DeleteShortUrlByUrlKeyController } from '@/modules/url-shortener/infra/http/fastify/controllers/delete-short-url-by-url-key.controller';
import { DeleteShortUrlByUrlKeyUseCase } from '@/modules/url-shortener/application/usecases/delete-short-url-by-url-key/delete-short-url-by-url-key.usecase';
import { NotificationError } from '@/shared/domain/errors/notification-error';

jest.mock(
  '@/modules/url-shortener/application/usecases/delete-short-url-by-url-key/delete-short-url-by-url-key.usecase',
);

describe('DeleteShortUrlByUrlKeyController', () => {
  let deleteShortUrlByUrlKeyController: DeleteShortUrlByUrlKeyController;
  let mockDeleteShortUrlByUrlKeyUseCase: jest.Mocked<DeleteShortUrlByUrlKeyUseCase>;

  const urlKey = '0196b230-b866-7218-b5c8-6af991656909';
  const userId = '0196b231-1b20-7455-81f5-f85f8c1330a8';

  const mockRequest = {
    params: {
      urlKey,
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

    mockDeleteShortUrlByUrlKeyUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<DeleteShortUrlByUrlKeyUseCase>;

    jest.spyOn(container, 'resolve').mockReturnValue(mockDeleteShortUrlByUrlKeyUseCase);

    deleteShortUrlByUrlKeyController = new DeleteShortUrlByUrlKeyController();
  });

  it('should delete the URL and return 204 status code', async () => {
    mockDeleteShortUrlByUrlKeyUseCase.execute.mockResolvedValueOnce(undefined);

    await deleteShortUrlByUrlKeyController.handle(mockRequest, mockReply);

    expect(container.resolve).toHaveBeenCalledWith(DeleteShortUrlByUrlKeyUseCase);
    expect(mockDeleteShortUrlByUrlKeyUseCase.execute).toHaveBeenCalledWith({
      urlKey,
      userId,
    });

    expect(mockReply.status).toHaveBeenCalledWith(204);
    expect(mockReply.send).toHaveBeenCalled();
  });

  it('should use the user ID from the request', async () => {
    const customUserId = 'custom-user-123';
    const customRequest = {
      ...mockRequest,
      user: { id: customUserId },
    } as unknown as FastifyRequest;

    mockDeleteShortUrlByUrlKeyUseCase.execute.mockResolvedValueOnce(undefined);

    await deleteShortUrlByUrlKeyController.handle(customRequest, mockReply);

    expect(mockDeleteShortUrlByUrlKeyUseCase.execute).toHaveBeenCalledWith({
      urlKey,
      userId: customUserId,
    });
  });

  it('should extract urlKey from request params', async () => {
    const customRequest = {
      ...mockRequest,
      params: { urlKey: urlKey },
    } as unknown as FastifyRequest;

    mockDeleteShortUrlByUrlKeyUseCase.execute.mockResolvedValueOnce(undefined);

    await deleteShortUrlByUrlKeyController.handle(customRequest, mockReply);

    expect(mockDeleteShortUrlByUrlKeyUseCase.execute).toHaveBeenCalledWith({
      urlKey,
      userId,
    });
  });

  it('should throw NotificationError when urlKey is missing', async () => {
    mockDeleteShortUrlByUrlKeyUseCase.execute.mockResolvedValueOnce(undefined);

    const mockRequestError = {
      params: {},
      user: {
        id: userId,
      },
    } as unknown as FastifyRequest;

    try {
      await deleteShortUrlByUrlKeyController.handle(mockRequestError, mockReply);
    } catch (error) {
      expect(error).toBeInstanceOf(NotificationError);

      const errors = (error as NotificationError).getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'The urlKey parameter is required',
        code: 'BAD_REQUEST',
        context: 'UrlShortener',
        field: 'urlKey',
      });
    }

    expect(mockDeleteShortUrlByUrlKeyUseCase.execute).not.toHaveBeenCalled();
    expect(mockReply.status).not.toHaveBeenCalled();
  });

  it('should propagate errors from the use case', async () => {
    const mockError = new Error('Test error');
    mockDeleteShortUrlByUrlKeyUseCase.execute.mockRejectedValueOnce(mockError);

    await expect(deleteShortUrlByUrlKeyController.handle(mockRequest, mockReply)).rejects.toThrow(
      'Test error',
    );

    expect(mockDeleteShortUrlByUrlKeyUseCase.execute).toHaveBeenCalledWith({
      urlKey,
      userId,
    });

    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });
});
