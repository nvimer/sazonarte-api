export interface BaseRepositoryInterface<T, CreateInput, UpdateInput> {
  findAll(): Promise<T[]>;
  findById(id: number): Promise<T | null>;
  create(data: CreateInput): Promise<T>;
  update(id: number, data: UpdateInput): Promise<T>;
  delete(id: number): Promise<T>;
}
