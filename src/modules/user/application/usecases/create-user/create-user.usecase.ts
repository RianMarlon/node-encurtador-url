import { HashProvider } from '@/shared/providers/hash/interfaces/hash-provider.interface';
import { inject, injectable } from 'tsyringe';
import { CreateUserUseCaseInputDTO } from './dto/create-user-usecase-input.dto';
import { CreateUserUseCaseOutputDTO } from './dto/create-user-usecase-output.dto';
import { UserRepository } from '@/modules/user/domain/repositories/user.repository';
import { NotificationError } from '@/shared/domain/errors/notification-error';
import { User } from '@/modules/user/domain/entities/user.entity';
import { PasswordStrengthSpecification } from '@/modules/user/domain/specifications/password-strength.specification';

@injectable()
export class CreateUserUseCase {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: UserRepository,
    @inject('HashProvider')
    private readonly hashProvider: HashProvider,
    @inject('PasswordStrengthSpecification')
    private readonly passwordStrengthSpec: PasswordStrengthSpecification,
  ) {}

  async execute(data: CreateUserUseCaseInputDTO): Promise<CreateUserUseCaseOutputDTO> {
    const userAlreadyExists = await this.userRepository.findByEmail(data.email?.toLowerCase());
    if (userAlreadyExists) {
      throw new NotificationError([
        {
          message: 'User already exists',
          code: 'BAD_REQUEST',
        },
      ]);
    }

    this.passwordStrengthSpec.validate(data.password);
    const passwordHashed = await this.hashProvider.hash(data.password);
    const user = new User({
      name: data.name,
      email: data.email?.toLowerCase(),
      password: passwordHashed,
    });

    await this.userRepository.create(user);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
