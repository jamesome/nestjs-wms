import { utilities, WinstonModuleOptions } from 'nest-winston';
import winstonDaily from 'winston-daily-rotate-file';
import * as winston from 'winston';

const env = process.env.NODE_ENV;
const logDir = __dirname + '/../../logs';

// Log Level별 파일에 Level별 로그만 기록하기 위함.
const filterByLevel = (level: string) => {
  return winston.format((info) => {
    return info.level === level ? info : false;
  })();
};

const dailyOptions = (level: string) => {
  return {
    level,
    datePattern: 'YYYY-MM-DD',
    dirname: logDir + `/${level}`,
    filename: `%DATE%.${level}.log`,
    // maxSize: '20m',
    maxFiles: '1d',
    zippedArchive: true,
    format: winston.format.combine(
      filterByLevel(level),
      winston.format.errors({ stack: true }),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ level, message, timestamp, stack }) => {
        return stack
          ? `${timestamp} [${level}]\n- ${message}\n- ${stack}`
          : `${timestamp} [${level}]\n- ${message}`;
      }),
    ),
  };
};

// rfc5424를 따르는 winston만의 log level
// error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
export const winstonOptions: WinstonModuleOptions = {
  transports: [
    new winston.transports.Console({
      level: env === 'production' ? 'http' : 'silly',
      format:
        env === 'production'
          ? winston.format.simple()
          : winston.format.combine(
              winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
              utilities.format.nestLike('WMS', {
                colors: true,
                prettyPrint: true,
                processId: true,
              }),
            ),
    }),

    new winstonDaily(dailyOptions('http')),
    // slack, sentry 사용
    // new winstonDaily(dailyOptions('warn')),
    // new winstonDaily(dailyOptions('error')),
  ],
};
