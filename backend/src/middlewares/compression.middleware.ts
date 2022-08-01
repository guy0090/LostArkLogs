import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUserAndLog } from '@/interfaces/auth.interface';
import { logger } from '@/utils/logger';
import { Response, NextFunction } from 'express';
import zlib from 'zlib';
import bytes from 'bytes';
import { md5 } from '@/utils/crypto';

export const brotliDecompress = async (req: RequestWithUserAndLog, res: Response, next: NextFunction) => {
  try {
    const body = [];
    const maxBodySize = bytes('30MB'); // TODO: adjust; a full Vykas clear was ~15MB
    let readBytes = 0;

    const brotli = zlib.createBrotliDecompress();
    req.pipe(brotli);

    brotli.on('data', chunk => {
      body.push(chunk);
      readBytes += chunk.length;

      if (readBytes > maxBodySize) {
        brotli.destroy();
        next(new HttpException(413, 'Request Entity Too Large'));
      }
    });

    brotli.on('end', async () => {
      const data = Buffer.concat(body).toString().replace(/\r?\n/g, '\n');
      const lines = data.trim().split(/\n/g);

      const unlisted = req.query['unlisted'];
      if (unlisted && unlisted === '0') req.unlisted = false;
      else req.unlisted = true;

      req.hash = md5(data);
      req.log = lines;
      next();
    });

    brotli.on('error', error => {
      logger.error(`Error decompressing brotli data: ${error}`);
      brotli.destroy();
      next(new HttpException(500, 'Bad Entity'));
    });

    req.on('error', error => {
      logger.error(`Error decompressing brotli data: ${error}`);
      if (brotli) brotli.destroy();
      next(new HttpException(500, 'Bad Entity'));
    });
  } catch (error) {
    next(error);
  }
};

export const gzipDecompress = async (req: RequestWithUserAndLog, res: Response, next: NextFunction) => {
  try {
    const body = [];
    const maxBodySize = bytes('30MB'); // TODO: adjust; a full Vykas clear was ~15MB
    let readBytes = 0;

    const gunzip = zlib.createGunzip();
    req.pipe(gunzip);

    gunzip.on('data', chunk => {
      body.push(chunk);
      readBytes += chunk.length;

      if (readBytes > maxBodySize) {
        gunzip.destroy();
        next(new HttpException(413, 'Request Entity Too Large'));
      }
    });

    gunzip.on('end', async () => {
      const data = Buffer.concat(body).toString().replace(/\r?\n/g, '\n');
      const lines = data.trim().split(/\n/g);

      const unlisted = req.query['unlisted'];
      if (unlisted && unlisted === '0') req.unlisted = false;
      else req.unlisted = true;

      req.hash = md5(data);
      req.log = lines;
      next();
    });

    gunzip.on('error', error => {
      logger.error(`Error decompressing gzip data: ${error}`);
      gunzip.destroy();
      next(new HttpException(500, 'Bad Entity'));
    });

    req.on('error', error => {
      logger.error(`Error decompressing gzip data: ${error}`);
      if (gunzip) gunzip.destroy();
      next(new HttpException(500, 'Bad Entity'));
    });
  } catch (error) {
    logger.error(`Error in gzipDecompress: ${error.message}`);
    next(new HttpException(500, 'Bad Entity'));
  }
};
