import 'reflect-metadata';
import { container } from 'tsyringe';
import { FastifyRequest, FastifyReply } from 'fastify';
import { UserFacade } from '@/modules/user/facade/user.facade';
import { CheckAuthenticateUserMiddleware } from '@/shared/infra/http/fastify/middlewares/check-authenticated-user.middleware';

jest.mock('tsyringe', () => {
  return {
    container: {
      resolve: jest.fn(),
    },
  };
});

describe('CheckAuthenticateUserMiddleware', () => {
  let checkAuthMiddleware: CheckAuthenticateUserMiddleware;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockUserFacade: {
    findById: jest.MockedFunction<typeof UserFacade.prototype.findById>;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockRequest = {
      user: {
        id: 'user-123',
      },
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    mockUserFacade = {
      findById: jest.fn(),
    };

    (container.resolve as jest.Mock).mockReturnValue(mockUserFacade);

    checkAuthMiddleware = new CheckAuthenticateUserMiddleware();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should update request.user with additional user info when user exists', async () => {
    const mockUserData = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserFacade.findById.mockResolvedValueOnce(mockUserData);

    await checkAuthMiddleware.handle(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(container.resolve).toHaveBeenCalledWith('UserFacade');
    expect(mockUserFacade.findById).toHaveBeenCalledWith({ id: 'user-123' });
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();

    expect(mockRequest.user).toEqual({
      id: 'user-123',
    });
  });

  it('should fnish the verification if user is not in request object', async () => {
    mockRequest.user = undefined;

    await checkAuthMiddleware.handle(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(container.resolve).not.toHaveBeenCalled();
    expect(mockReply.status).not.toHaveBeenCalled();
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('should return 401 if user is not found in database', async () => {
    mockUserFacade.findById.mockResolvedValueOnce(null);

    await checkAuthMiddleware.handle(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(container.resolve).toHaveBeenCalledWith('UserFacade');
    expect(mockUserFacade.findById).toHaveBeenCalledWith({ id: 'user-123' });
    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      errors: [{ message: 'User not found' }],
    });
  });

  it('should return 500 if the userFacade.findById throws an error', async () => {
    const mockError = new Error('Database error');
    mockUserFacade.findById.mockRejectedValueOnce(mockError);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    await checkAuthMiddleware.handle(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(container.resolve).toHaveBeenCalledWith('UserFacade');
    expect(mockUserFacade.findById).toHaveBeenCalledWith({ id: 'user-123' });
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error verifying user authentication:', mockError);
    expect(mockReply.status).toHaveBeenCalledWith(500);
    expect(mockReply.send).toHaveBeenCalledWith({
      errors: [{ message: 'Internal server error' }],
    });

    consoleErrorSpy.mockRestore();
  });
});
