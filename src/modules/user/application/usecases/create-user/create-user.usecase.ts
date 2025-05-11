import { inject, injectable } from 'tsyringe';

import { HashProvider } from '@/shared/domain/providers/hash-provider.interface';
import { CreateUserUseCaseInputDTO } from './dto/create-user-usecase-input.dto';
import { CreateUserUseCaseOutputDTO } from './dto/create-user-usecase-output.dto';
import { UserRepository } from '@/modules/user/domain/repositories/user.repository';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { User } from '@/modules/user/domain/entities/user.entity';
import UseCaseInterface from '@/shared/application/use-case.interface';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

@injectable()
export class CreateUserUseCase implements UseCaseInterface {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: UserRepository,
    @inject('HashProvider')
    private readonly hashProvider: HashProvider,
    @inject('LoggerProvider')
    private readonly logger: LoggerProvider,
  ) {}

  async execute(data: CreateUserUseCaseInputDTO): Promise<CreateUserUseCaseOutputDTO> {
    this.logger.debug(`Checking if the user with email ${data.email} already exists`);
    const userAlreadyExists = await this.userRepository.findByEmail(data.email?.toLowerCase());
    if (userAlreadyExists) {
      this.logger.warn(`User with email ${data.email} already exists`);
      throw new NotificationError([
        {
          message: 'User already exists',
          code: 'BAD_REQUEST',
        },
      ]);
    }
    this.logger.debug(`User with email ${data.email} does not exist`);

    this.logger.debug(`Generating the hash for the password of the user with email ${data.email}`);
    const passwordHashed = await this.hashProvider.hash(data.password);
    const user = new User({
      name: data.name,
      email: data.email,
      password: passwordHashed,
    });
    this.logger.debug(`Password hash generated for the user with email ${data.email}`);

    await this.userRepository.create(user);
    this.logger.info(
      `User with the following data created successfully: ${JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })}`,
    );
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
