import { HttpException } from '@/exceptions/HttpException';
import { Brotli, Gzip } from '@/utils/compression';
import { logger } from '@/utils/logger';
import { Request, Response, NextFunction } from 'express';

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
      logger.error(`Error decompressing gzip data: ${error}`);
      next(new HttpException(500, 'Bad Entity'));
    });
  } catch (error) {
    next(error);
  }
};

export const gzipDecompress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buffer = [];
    req.on('data', chunk => {
      buffer.push(chunk);
    });

    req.on('end', async () => {
      const decompressedData = JSON.parse(await Gzip.decompress(Buffer.concat(buffer)));
      const apiKey = decompressedData.key;
      const { data } = decompressedData.data;

      const decompressedLog = JSON.parse(await Gzip.decompress(Buffer.from(data)));

      req.body = { key: apiKey, data: decompressedLog };
      next();
    });

    req.on('error', error => {
      logger.error(`Error decompressing gzip data: ${error}`);
      next(new HttpException(500, 'Bad Entity'));
    });
  } catch (error) {
    logger.error(`Error in gzipDecompress: ${error.message}`);
    next(new HttpException(500, 'Bad Entity'));
  }
};
