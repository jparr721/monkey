import { Repository } from 'typeorm';

export default class ModelController<T> {
  constructor(private readonly repository: Repository<T>) {}

  public async get(): Promise<T[]> {
    return this.repository.find();
  }

  public async getOne(id: string): Promise<T> {
    return this.repository.findOneOrFail(id);
  }

  public async createOne(dto: T): Promise<T> {
    return this.repository.save(dto);
  }

  public async updateOne(dto: T): Promise<T> {
    return this.repository.save(dto);
  }

  public async deleteOne(dto: T): Promise<T> {
    return this.repository.remove(dto);
  }
}
