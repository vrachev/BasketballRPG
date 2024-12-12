import pino from 'pino';

export const logger = pino({
  browser: {
    asObject: true,
  },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
  level: 'debug',
}); 
