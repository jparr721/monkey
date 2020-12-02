// expressjs
import express, { Express, Request, Response, NextFunction } from 'express';

// node core types
import { Server } from 'http';
import path from 'path';

// typeorm
import { createConnection } from 'typeorm';

// json support
import bodyParser from 'body-parser';

// request logging
import morgan from 'morgan';

// security
import helmet from 'helmet';

// gzip compression
import compression from 'compression';

// template engine
import exphbs from 'express-handlebars';

// parse cookies from browser requests
import cookieParser from 'cookie-parser';

// db configs
import config from './db/config';

// main logger
import logger from './logger';

// .env loader
import './dotenv';

// router imports
import KeysRouter from './routes/keys';
import PublicRouter from './routes/public';

// validation
import { errors } from 'celebrate';

/* eslint-disable @typescript-eslint/no-explicit-any */
function logFormat(tokens: any, req: Request, res: Response): string {
  const logObj = {
    app_name: `monkey`,
    timestamp: tokens.date(req, res, 'clf'),
    request_ip: tokens['remote-addr'](req, res),
    request_user: tokens['remote-user'](req, res),
    request_method: tokens.method(req, res),
    request: tokens.url(req, res),
    response_status: tokens.status(req, res),
    request_bytes_sent: tokens.res(req, res, 'content-length'),
    http_referrer: tokens.referrer(req, res),
    request_user_agent: tokens['user-agent'](req, res),
    response_time: tokens['response-time'](req, res),
    request_id: req.headers['x-request-id'],
    server_name: req.headers.host,
    ui_app_name: req.get('AppName'),
    ui_app_version: req.get('AppVersion'),
    ui_app_platform: req.get('AppPlatform'),
  };

  return JSON.stringify(logObj);
}

function makeRouter(app: Express): Express {
  app.use('/keys', KeysRouter());
  app.use('/', PublicRouter());
  return app;
}

function initializeApp(): Express {
  const app = express();

  app.engine(
    'hbs',
    exphbs({
      defaultLayout: 'main',
      extname: '.hbs',
    }),
  );

  app.set('view engine', 'hbs');
  app.set('views', path.join(__dirname, 'public'));

  app.disable('x-powered-by');
  app.enable('strict routing');
  app.enable('case sensitive routing');

  [
    () => bodyParser.json(),
    () => bodyParser.urlencoded({ extended: false, limit: '5mb' }),
    () => morgan(logFormat),
    () => compression(),
    () => helmet(),
    () => errors(),
    () => cookieParser(),
  ].forEach((m) => app.use(m()));

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(err.message);
    if (!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
  });

  return app;
}

export default async function start(): Promise<Server> {
  await createConnection(config);
  const initApp = initializeApp();
  const app = makeRouter(initApp);
  const port = process.env.NODE_PORT;

  return app.listen(port, () => logger.info(`Running on port ${port}`));
}

start().catch((e) => logger.error(e.message));
