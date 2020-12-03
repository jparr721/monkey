import { getConnection, Repository } from 'typeorm';
import omit from 'lodash/omit';

import { hashPassword, checkPassword } from '../lib/crypto/passwords';
import { MonkeyBusiness } from './entities/monkey-business';
import { encodeJwt } from '../lib/tokens/tokens';

export default class MonkeyBusinessModel {
  private repository: Repository<MonkeyBusiness>;
  constructor() {
    this.repository = getConnection().getRepository(MonkeyBusiness);
  }

  /**
   * gets one password
   */
  public async get(): Promise<MonkeyBusiness | undefined> {
    const passwords = await this.repository.find();

    if (passwords.length === 0) {
      return undefined;
    }

    return passwords[0];
  }

  public async login(password: string): Promise<string | undefined> {
    const monkeyBusiness = await this.get();

    if (!monkeyBusiness) {
      return this.createOne(password);
    }

    if (!(await checkPassword(password, monkeyBusiness.biz))) {
      return '';
    }

    return encodeJwt();
  }

  /**
   * creates one username/password with root password
   */
  public async createOne(password: string): Promise<string> {
    const [, count] = await this.repository.findAndCount();

    if (count > 1) {
      throw new Error('Password already set.');
    }

    const biz = await hashPassword(password);
    await this.repository.save({ biz });

    return encodeJwt();
  }

  public async updateOne(
    oldPassword: string,
    newPassword: string,
  ): Promise<string | undefined> {
    const monkeyBusiness = await this.get();

    if (!monkeyBusiness) {
      return undefined;
    }

    if (!checkPassword(oldPassword, monkeyBusiness.biz)) {
      return undefined;
    }

    const newMonkeyBusiness = omit({ ...monkeyBusiness, biz: newPassword }, [
      'createdAt',
      'updatedAt',
    ]);

    await this.repository.save(newMonkeyBusiness);
    return encodeJwt();
  }
}
