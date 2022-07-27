import { pages as pagesPreset } from '@/config/pages';
import { Page } from '@/interfaces/page.interface';
import pageModel from '@/models/page.model';
import { logger } from '@/utils/logger';

class PageService {
  public pages = pageModel;

  /**
   * Create the default pages provided in `config/pages.ts` if they don't exist.
   * @returns The created pages if any
   */
  public static async initializePages(): Promise<Page[]> {
    try {
      const existingPages = await pageModel.find({ _id: { $in: pagesPreset.map(p => p._id) } });
      if (existingPages.length > 0) {
        logger.info('Skipping pages initialization because pages already exist');
        return [];
      } else {
        const pages = await pageModel.create(pagesPreset);
        if (!pages) throw new Error('Error creating pages');

        return pages;
      }
    } catch (err) {
      throw err;
    }
  }

  /**
   * Create a new page
   * @param page The page to add
   * @returns The created page
   */
  public async createPage(page: Page): Promise<Page> {
    try {
      const findPage = await this.pages.findOne({ id: page.id });
      if (findPage) throw new Error('Page already exists');

      const createPage = await this.pages.create(page);
      if (!createPage) throw new Error('Error creating page');

      return createPage;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Update an existing page
   * @param page The page to update
   * @returns The updated `page`
   */
  public async updatePage(page: Page): Promise<Page> {
    try {
      const updatePage = await this.pages.findOneAndUpdate({ id: page.id }, { $set: page });
      if (!updatePage) throw new Error('Error updating page');

      return updatePage;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Delete a page
   * @param id The page id
   * @returns Nothing
   */
  public async deletePage(id: number): Promise<void> {
    try {
      const deletePage = await this.pages.deleteOne({ id });
      if (!deletePage) throw new Error('Error deleting page');

      return;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get a page by its id
   * @param id The page id
   * @returns The found page
   */
  public async getPageById(id: number): Promise<Page> {
    try {
      const findPage = await this.pages.findOne({ id });
      if (!findPage) throw new Error('Page not found');

      return findPage;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Get a page by its name
   * @param name The page name
   * @returns The found page
   */
  public async getPageByName(name: string): Promise<Page> {
    try {
      const findPage = await this.pages.findOne({ name });
      if (!findPage) throw new Error('Page not found');

      return findPage;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Add permissions to a page. Allows only users with the specified permissions to access the page.
   * @param pageId The page id
   * @param permissions The permissions required to view to page
   * @returns The updated page
   */
  public async addPermissions(pageId: number, permissions: string[]): Promise<Page> {
    try {
      const findPage = await this.pages.findOne({ id: pageId });
      if (!findPage) throw new Error('Page not found');

      const pagePermissions = findPage.permissions;
      const update = new Set([...pagePermissions, ...permissions]);

      const updatePage = await this.pages.findByIdAndUpdate(findPage._id, { $set: { permissions: update } });
      if (!updatePage) throw new Error('Error updating page');

      return updatePage;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Remove permissions required froma page. Allows only users with the specified permissions to access the page.
   * @param pageId The page id
   * @param permissions The permissions to remove
   * @returns The updated page
   */
  public async removePermissions(pageId: number, permissions: string[]): Promise<Page> {
    try {
      const findPage = await this.pages.findOne({ id: pageId });
      if (!findPage) throw new Error('Page not found');

      const pagePermissions = findPage.permissions;
      const update = pagePermissions.filter(p => !permissions.includes(p));

      const updatePage = await this.pages.findByIdAndUpdate(findPage._id, { $set: { permissions: update } });

      if (!updatePage) throw new Error('Error updating page');

      return updatePage;
    } catch (err) {
      throw err;
    }
  }
}

export default PageService;
