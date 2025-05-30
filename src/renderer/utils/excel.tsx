import * as XLSX from 'xlsx'
const remote = require('@electron/remote')
const { dialog } = remote
const fs = remote.require('fs')

interface CellData {
  value: any;
  address: string;  // 例如: 'A1', 'B2' 等
  row: number;      // 行号（从1开始）
  col: string;      // 列标识（A, B, C...）
}

class ExcelUtils {
  async getTableData(): Promise<CellData[]> {
    try {
      // 打开文件选择对话框
      const result = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{ name: 'Excel Files', extensions: ['xlsx', 'xls'] }]
      })

      if (result.canceled || result.filePaths.length === 0) {
        return []
      }

      // 读取文件内容
      const filePath = result.filePaths[0]
      const fileData = fs.readFileSync(filePath)
      const workbook = XLSX.read(fileData, { type: 'buffer' })

      // 获取第一个工作表
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]

      // 获取工作表的有效范围
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
      const cells: CellData[] = []

      // 遍历每个单元格
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          // 获取单元格地址（例如：'A1', 'B2'）
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
          const cell = worksheet[cellAddress]

          if (cell) {
            // 获取列标识（A, B, C...）
            const colLetter = XLSX.utils.encode_col(C)

            cells.push({
              value: cell.v, // 单元格的值
              address: cellAddress,
              row: R + 1, // 转换为1-based行号
              col: colLetter
            })
          }
        }
      }

      return cells
    } catch (error) {
      console.error('Error reading Excel file:', error)
      throw error
    }
  }
}

export const excelUtils = new ExcelUtils()
