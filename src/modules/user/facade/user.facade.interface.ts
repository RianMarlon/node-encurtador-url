export interface FindByIdFacadeInputDto {
  id: string;
}

export interface FindByIdFacadeOutputDto {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FindByEmailFacadeInputDto {
  email: string;
}

export interface FindByEmailFacadeOutputDto {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFacadeInterface {
  findById(input: FindByIdFacadeInputDto): Promise<FindByIdFacadeOutputDto | null>;
  findByEmail(input: FindByEmailFacadeInputDto): Promise<FindByEmailFacadeOutputDto | null>;
}
