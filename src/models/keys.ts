import { Repository, getConnection } from 'typeorm';

import { Keys } from './entities/keys';
import { encryptString, decryptString } from '../lib/crypto/cipher';

export default class KeysModel {
  private repository: Repository<Keys>;

  constructor() {
    this.repository = getConnection().getRepository(Keys);
  }

  /**
   * gets all passwords with root password
   */
  public async get(): Promise<Keys[]> {
    const keys = await this.repository.find();

    return keys.map((k) => ({ ...k, key: decryptString(JSON.parse(k.key)) }));
  }

  /**
   * gets one password by Id with root password
   */
  public async getOne(id: string): Promise<Keys> {
    return this.repository.findOneOrFail(id);
  }

  /**
   * creates one username/password with root password
   */
  public async createOne(dto: Keys): Promise<Keys> {
    const key = encryptString(dto.key);
    return this.repository.save({ ...dto, key });
  }

  public async updateOne(dto: Keys): Promise<Keys> {
    return this.repository.save(dto);
  }

  public async deleteOne(dto: Keys): Promise<Keys> {
    return this.repository.remove(dto);
  }
}
