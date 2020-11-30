import { ConnectionOptions } from 'typeorm';
import { LoggerOptions } from 'typeorm/logger/LoggerOptions';

import { dotenvValue, DotenvVariable } from '../dotenv';

const defaultEnvironment = 'development';
const currentEnvironment = dotenvValue(
  DotenvVariable.NodeEnv,
  defaultEnvironment,
);
const logging: LoggerOptions =
  currentEnvironment === 'production'
    ? ['error']
    : ['error', 'query', 'schema'];

const config: ConnectionOptions = {
  type: 'sqlite',
  database: `monkey_${currentEnvironment}`,

  entities: [__dirname + '/../models/entities/*{.ts,.js}'],
  synchronize: false,
  migrationsRun: false,
  logging,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/db/migrations',
  },
};

export = config;
