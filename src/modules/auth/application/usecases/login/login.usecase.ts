import { injectable, inject } from 'tsyringe';

import { HashProvider } from '@/shared/domain/providers/hash-provider.interface';
import { JwtProvider } from '@/shared/domain/providers/jwt-provider.interface';
import { NotificationError } from '@/shared/domain/errors/notification-error';

import { LoginUseCaseInputDTO } from './dto/login-usecase-input.dto';
import { LoginUseCaseOutputDTO } from './dto/login-usecase-output.dto';
import { UserFacadeInterface } from '@/modules/user/facade/user.facade.interface';
import UseCaseInterface from '@/shared/application/use-case.interface';

@injectable()
export class LoginUseCase implements UseCaseInterface {
  constructor(
    @inject('UserFacade')
    private userFacade: UserFacadeInterface,
    @inject('HashProvider')
    private hashProvider: HashProvider,
    @inject('JwtProvider')
    private jwtProvider: JwtProvider,
  ) {}

  async execute({ email, password }: LoginUseCaseInputDTO): Promise<LoginUseCaseOutputDTO> {
    const user = await this.userFacade.findByEmail({ email: email.toLowerCase() });
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
