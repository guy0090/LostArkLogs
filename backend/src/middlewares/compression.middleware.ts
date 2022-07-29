import { HttpException } from '@/exceptions/HttpException';
import { RequestWithUserAndLog } from '@/interfaces/auth.interface';
import { Brotli, Gzip } from '@/utils/compression';
import { logger } from '@/utils/logger';
import { Request, Response, NextFunction } from 'express';
import bytes from 'bytes';

export const brotliDecompress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buffer = [];
    req.on('data', chunk => {
      buffer.push(chunk);
    });

    req.on('end', async () => {
      const decompressedData = JSON.parse(await Brotli.decompress(Buffer.concat(buffer)));
      const apiKey = decompressedData.key;
      const { data } = decompressedData.data;

      const decompressedLog = JSON.parse(await Brotli.decompress(Buffer.from(data)));

      req.body = { key: apiKey, data: decompressedLog };
      next();
    });

    req.on('error', error => {
      logger.error(`Error decompressing brotli data: ${error}`);
      next(new HttpException(500, 'Bad Entity'));
    });
  } catch (error) {
    next(error);
  }
};

export const gzipDecompress = async (req: RequestWithUserAndLog, res: Response, next: NextFunction) => {
  try {
    const body = [];
    const maxBodySize = bytes('1MB');
    let readBytes = 0;

    req.on('data', chunk => {
      body.push(chunk);
      readBytes += chunk.length;

      if (readBytes > maxBodySize) {
        req.destroy();
        next(new HttpException(413, 'Request Entity Too Large'));
      }
    });

    req.on('end', async () => {
      const data = Buffer.concat(body);

      const decompressedData = await Gzip.decompress(data);
      const lines = decompressedData.trim().split('\n');

      req.log = lines;
      return next();
    });

    req.on('error', error => {
      logger.error(`Error decompressing gzip data: ${error}`);
      return next(new HttpException(500, 'Bad Entity'));
    });
  } catch (error) {
    logger.error(`Error in gzipDecompress: ${error.message}`);
    next(new HttpException(500, 'Bad Entity'));
  }
};
