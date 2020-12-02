import { Repository, getConnection } from 'typeorm';

import { MonkeyBusiness } from './entities/monkey-business';
import { Keys } from './entities/keys';
import { checkPassword } from '../lib/crypto/passwords';
import { encryptString, decryptString } from '../lib/crypto/cipher';

export default class KeysModel {
  private monkeyBusinessRepository: Repository<MonkeyBusiness> = getConnection().getRepository(
    MonkeyBusiness,
  );

  constructor(private readonly repository: Repository<Keys>) {}

  private async verifyUserAuthentication(
    monkeyBusiness: string,
  ): Promise<boolean> {
    const passwordEntries = await this.monkeyBusinessRepository.find();

    if (!passwordEntries || passwordEntries.length === 0) {
      throw new Error('No master password configured');
    }

    // Always take the first entry, this is a bit brutish, but it'll get the job done with
    // minimal pain (or thinking)
    const { biz } = passwordEntries[0];

    return checkPassword(monkeyBusiness, biz);
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
  public async getOne(id: string, monkeyBusiness: string): Promise<Keys> {
    await this.verifyUserAuthentication(monkeyBusiness);

    return this.repository.findOneOrFail(id);
  }

  /**
   * creates one username/password with root password
   */
  public async createOne(dto: Keys, monkeyBusiness: string): Promise<Keys> {
    await this.verifyUserAuthentication(monkeyBusiness);

    // Encrypt the password we are storing
    const key = encryptString(dto.key);

    return this.repository.save({ ...dto, key });
  }

  public async updateOne(dto: Keys, monkeyBusiness: string): Promise<Keys> {
    await this.verifyUserAuthentication(monkeyBusiness);

    return this.repository.save(dto);
  }

  public async deleteOne(dto: Keys, monkeyBusiness: string): Promise<Keys> {
    await this.verifyUserAuthentication(monkeyBusiness);

    return this.repository.remove(dto);
  }
}
