export default interface UseCaseInterface {
  execute(input: unknown): Promise<unknown>;
}
