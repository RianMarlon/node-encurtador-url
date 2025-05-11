import { injectable, inject } from 'tsyringe';

import { HashProvider } from '@/shared/domain/providers/hash-provider.interface';
import { JwtProvider } from '@/shared/domain/providers/jwt-provider.interface';
import { NotificationError } from '@/shared/domain/errors/notification-error';

import { LoginUseCaseInputDTO } from './dto/login-usecase-input.dto';
import { LoginUseCaseOutputDTO } from './dto/login-usecase-output.dto';
import { UserFacadeInterface } from '@/modules/user/facade/user.facade.interface';
import UseCaseInterface from '@/shared/application/use-case.interface';
import { LoggerProvider } from '@/shared/domain/providers/logger-provider.interface';

@injectable()
export class LoginUseCase implements UseCaseInterface {
  constructor(
    @inject('UserFacade')
    private userFacade: UserFacadeInterface,
    @inject('HashProvider')
    private hashProvider: HashProvider,
    @inject('JwtProvider')
    private jwtProvider: JwtProvider,
    @inject('LoggerProvider')
    private logger: LoggerProvider,
  ) {}

  async execute({ email, password }: LoginUseCaseInputDTO): Promise<LoginUseCaseOutputDTO> {
    this.logger.debug(`Checking if the user with email ${email} already exists`);
    const user = await this.userFacade.findByEmail({ email: email.toLowerCase() });
    if (!user) {
      this.logger.warn(`User with email ${email} not found`);
      throw new NotificationError([
        {
          message: 'Invalid email or password',
          code: 'UNAUTHORIZED',
        },
      ]);
    }
    this.logger.debug(`User with email ${email} found`);

    this.logger.debug(`Checking if the password matches for user with email ${email}`);
    const passwordMatches = await this.hashProvider.compare(password, user.password);
    if (!passwordMatches) {
      this.logger.warn(`Password does not match for the user with email ${email}`);
      throw new NotificationError([
        {
          message: 'Invalid email or password',
          code: 'UNAUTHORIZED',
        },
      ]);
    }
    this.logger.debug(`Password matches for the user with email ${email}`);

    this.logger.debug(`Generating a token for the user with email ${email}`);
    const token = await this.jwtProvider.generate({
      sub: user.id,
      name: user.name,
      email: user.email,
    });
    this.logger.info(`Login for the user with email ${email} was successful`);

    return {
      accessToken: token,
    };
  }
}
