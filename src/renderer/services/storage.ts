const remote = require('@electron/remote')
const { join } = remote.require('path')
const fs = remote.require('fs/promises')

export interface PriceItem {
  id: number
  name: string
  price: number
}

const DATA_FILE = 'prices.el'

class StorageService {
  private dataPath: string

  constructor() {
    // 获取应用程序的用户数据目录
    const userDataPath = remote.app.getPath('userData')
    this.dataPath = join(userDataPath, DATA_FILE)
  }

  async readData(): Promise<PriceItem[]> {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      // 如果文件不存在或出错，返回空数组
      return []
    }
  }

  async writeData(data: PriceItem[]): Promise<void> {
    try {
      await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2), 'utf-8')
    } catch (error) {
      console.error('Error writing data:', error)
      throw new Error('Failed to save data')
    }
  }
}

export const storageService = new StorageService()