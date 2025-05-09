import { injectable, inject } from 'tsyringe';

import { UserRepository } from '@/modules/user/domain/repositories/user.repository';
import { HashProvider } from '@/shared/providers/hash/interfaces/hash-provider.interface';
import { JwtProvider } from '@/shared/providers/jwt/interfaces/jwt-provider.interface';
import { NotificationError } from '@/shared/domain/errors/notification-error';

import { LoginUseCaseInputDTO } from './dto/login-usecase-input.dto';
import { LoginUseCaseOutputDTO } from './dto/login-usecase-output.dto';
import UseCaseInterface from '@/shared/application/use-case.interface';

@injectable()
export class LoginUseCase implements UseCaseInterface {
  constructor(
    @inject('UserRepository')
    private userRepository: UserRepository,
    @inject('HashProvider')
    private hashProvider: HashProvider,
    @inject('JwtProvider')
    private jwtProvider: JwtProvider,
  ) {}

  async execute({ email, password }: LoginUseCaseInputDTO): Promise<LoginUseCaseOutputDTO> {
    const user = await this.userRepository.findByEmail(email.toLowerCase());

    if (!user) {
      throw new NotificationError([
        {
          message: 'Invalid email or password',
          code: 'UNAUTHORIZED',
        },
      ]);
    }

    const passwordMatches = await this.hashProvider.compare(password, user.password);

    if (!passwordMatches) {
      throw new NotificationError([
        {
          message: 'Invalid email or password',
          code: 'UNAUTHORIZED',
        },
      ]);
    }

    const token = await this.jwtProvider.generate({
      sub: user.id,
      name: user.name,
      email: user.email,
    });

    return {
      accessToken: token,
    };
  }
}
