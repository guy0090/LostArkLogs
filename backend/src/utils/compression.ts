import zlib from 'zlib';

/**
 * Brotli (de)compression utility
 */
export const Brotli = {
  /**
   * Compress a buffer with Brotli compression.
   * @param {Buffer} buffer The buffer to compress
   * @returns {Promise<Buffer>} A promise that resolves to the compressed buffer
   */
  compress(buffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      zlib.brotliCompress(
        buffer,
        {
          params: { [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT },
        },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        },
      );
    });
  },

  /**
   * Compress a string with Brotli compression.
   * @param {string} string The string to compress
   * @returns {Promise<Buffer>} The compressed string
   */
  compressString(string: any, encoding: any = 'utf-8'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const buffer = Buffer.from(string, encoding);
      zlib.brotliCompress(
        buffer,
        {
          params: { [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT },
        },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        },
      );
    });
  },

  /**
   * Decompress a buffer to string format.
   * @param {Buffer} buffer The buffer to decompress.
   * @returns {Promise<String>} A promise that resolves to the decompressed string.
   */
  decompress(buffer: Buffer, encoding: any = 'utf-8'): Promise<string> {
    return new Promise((resolve, reject) => {
      zlib.brotliDecompress(
        buffer,
        {
          params: { [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT },
        },
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result.toString(encoding));
          }
        },
      );
    });
  },
};

/**
 * Gzip (de)compression utility
 */
export const Gzip = {
  /**
   * Asyncronously compress a buffer with gzip compression.
   *
   * @param buffer The buffer to compress
   * @returns A promise that resolves to the compressed buffer
   */
  compress(buffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      zlib.gzip(buffer, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  /**
   * Synchronously compress a buffer with gzip compression.
   *
   * @param buffer The buffer to compress
   * @returns The compressed buffer
   */
  compressSync(buffer: Buffer): Buffer {
    try {
      return zlib.gzipSync(buffer);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Asyncronously compress a string with gzip compression.
   *
   * @param string The string to compress
   * @returns The compressed string
   */
  compressString(string: any, encoding: any = 'utf-8'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const buffer = Buffer.from(string, encoding);
      zlib.gzip(buffer, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  },

  /**
   * Synchronously compress a string with gzip compression.
   *
   * @param string The string to compress
   * @returns The compressed string
   */
  compressStringSync(string: any, encoding: any = 'utf-8'): Buffer {
    try {
      const buffer = Buffer.from(string, encoding);
      return zlib.gzipSync(buffer);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Asyncronously decompress a buffer to string format.
   *
   * @param {Buffer} buffer The buffer to decompress.
   * @returns {Promise<String>} A promise that resolves to the decompressed string.
   */
  decompress(buffer: Buffer, encoding: any = 'utf-8'): Promise<string> {
    return new Promise((resolve, reject) => {
      zlib.gunzip(buffer, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.toString(encoding));
        }
      });
    });
  },

  /**
   * Synchronously decompress a buffer to string format.
   *
   * @param buffer The buffer to decompress.
   * @returns The decompressed string.
   */
  decompressSync(buffer: Buffer, encoding: any = 'utf-8'): string {
    try {
      return zlib.gunzipSync(buffer).toString(encoding);
    } catch (error) {
      throw error;
    }
  },
};
