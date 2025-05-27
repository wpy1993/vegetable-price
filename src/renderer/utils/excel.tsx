import * as XLSX from 'xlsx'
const remote = require('@electron/remote')
const { dialog } = remote
const fs = remote.require('fs')

class ExcelUtils {
  async getTableData(): Promise<any[]> {
    try {
      // 打开文件选择对话框
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
          { name: 'Excel Files', extensions: ['xlsx', 'xls'] }
        ]
      })

      if (result.canceled || result.filePaths.length === 0) {
        return []
      }

      // 读取文件内容
      const filePath = result.filePaths[0]
      const fileData = fs.readFileSync(filePath)

      // 使用二进制数据创建工作簿
      const workbook = XLSX.read(fileData, { type: 'buffer' })

      // 获取第一个工作表
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]

      // 处理合并单元格
      if (worksheet['!merges']) {
        worksheet['!merges'].forEach(merge => {
          // 获取合并区域的值（通常是左上角单元格的值）
          const topLeftCell = XLSX.utils.encode_cell({ r: merge.s.r, c: merge.s.c })
          const value = worksheet[topLeftCell]?.v

          // 将值复制到合并区域的每个单元格
          for (let row = merge.s.r; row <= merge.e.r; row++) {
            for (let col = merge.s.c; col <= merge.e.c; col++) {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
              if (!worksheet[cellAddress]) {
                worksheet[cellAddress] = { t: 's', v: value }
              }
            }
          }
        })
      }

      // 将工作表转换为JSON数组，设置defval确保空单元格有值
      const data = XLSX.utils.sheet_to_json(worksheet, {
        defval: '', // 空单元格的默认值
        raw: false, // 返回格式化的字符串而不是原始类型
        blankrows: false // 忽略空行
      })

      return data
    } catch (error) {
      console.error('Error reading Excel file:', error)
      throw error
    }
  }
}

export const excelUtils = new ExcelUtils()
