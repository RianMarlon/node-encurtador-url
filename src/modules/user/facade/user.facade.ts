import { inject, injectable } from 'tsyringe';
import {
  FindByEmailFacadeInputDto,
  FindByEmailFacadeOutputDto,
  FindByIdFacadeInputDto,
  FindByIdFacadeOutputDto,
  UserFacadeInterface,
} from './user.facade.interface';
import { UserRepository } from '../domain/repositories/user.repository';

@injectable()
export class UserFacade implements UserFacadeInterface {
  constructor(
    @inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async findById(input: FindByIdFacadeInputDto): Promise<FindByIdFacadeOutputDto | null> {
    const user = await this.userRepository.findById(input.id);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findByEmail(input: FindByEmailFacadeInputDto): Promise<FindByEmailFacadeOutputDto | null> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
