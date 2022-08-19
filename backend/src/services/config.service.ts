import { Service } from '@/interfaces/service.interface';
import { bosses } from '@/config/supported-bosses';
import serviceModel from '@/models/service.model';
import { logger } from '@/utils/logger';
import RedisService from './redis.service';

class ConfigService {
  public config = serviceModel;

  public static async initializeConfig(): Promise<Service> {
    try {
      const existingConfig = await serviceModel.findById(0);
      if (existingConfig) {
        logger.info('Skipping config initialization because config already exists');
        RedisService.set('service_config', JSON.stringify(existingConfig));
        return existingConfig;
      } else {
        const config = await serviceModel.create({ _id: 0, defaultRole: 1, allowUploads: true, locked: false, supportedBosses: bosses });
        RedisService.set('service_config', JSON.stringify(config));
        if (!config) throw new Error('Error creating config');

        return config;
      }
    } catch (err) {
      throw err;
    }
  }

  public async updateConfig(config: Service): Promise<Service> {
    try {
      const updateConfig = await this.config.findByIdAndUpdate(0, { $set: config }, { new: true });
      if (!updateConfig) throw new Error('Error updating config');

      return updateConfig;
    } catch (err) {
      throw err;
    }
  }

  public async getConfig(): Promise<Service> {
    try {
      const cached = await RedisService.get('service_config');
      if (cached) return JSON.parse(cached);

      const config = await this.config.findById(0);
      if (!config) throw new Error('Error getting config');

      RedisService.set('service_config', JSON.stringify(config));
      return config;
    } catch (err) {
      throw err;
    }
  }

  public async setDefaultRole(role: number): Promise<Service> {
    try {
      const config = await this.getConfig();
      config.defaultRole = role;
      await this.updateConfig(config);
      RedisService.set('service_config', JSON.stringify(config));
      return config;
    } catch (err) {
      throw err;
    }
  }

  public async setAllowUploads(allowUploads: boolean): Promise<Service> {
    try {
      const config = await this.getConfig();
      config.allowUploads = allowUploads;
      await this.updateConfig(config);
      RedisService.set('service_config', JSON.stringify(config));
      return config;
    } catch (err) {
      throw err;
    }
  }

  public async setLocked(locked: boolean): Promise<Service> {
    try {
      const config = await this.getConfig();
      config.locked = locked;
      await this.updateConfig(config);
      RedisService.set('service_config', JSON.stringify(config));
      return config;
    } catch (err) {
      throw err;
    }
  }

  public async setSupportedBosses(supportedBosses: number[]): Promise<Service> {
    try {
      const config = await this.getConfig();
      config.supportedBosses = supportedBosses;
      await this.updateConfig(config);
      RedisService.set('service_config', JSON.stringify(config));
      return config;
    } catch (err) {
      throw err;
    }
  }

  public async addSupportedBoss(bossId: number): Promise<Service> {
    try {
      const config = await this.getConfig();
      config.supportedBosses.push(bossId);
      await this.updateConfig(config);
      RedisService.set('service_config', JSON.stringify(config));
      return config;
    } catch (err) {
      throw err;
    }
  }

  public async removeSupportedBoss(bossId: number): Promise<Service> {
    try {
      const config = await this.getConfig();
      config.supportedBosses = config.supportedBosses.filter(boss => boss !== bossId);
      await this.updateConfig(config);
      RedisService.set('service_config', JSON.stringify(config));
      return config;
    } catch (err) {
      throw err;
    }
  }
}

export default ConfigService;
