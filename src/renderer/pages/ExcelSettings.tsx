import React from 'react'
import { excelUtils } from '../utils/excel'

const ExcelSettings: React.FC = () => {
  const handleImport = async () => {
    try {
      const cells = await excelUtils.getTableData()

      // 按行号和列标识排序
      const sortedCells = cells.sort((a, b) => {
        if (a.row !== b.row) {
          return a.row - b.row
        }
        return a.col.localeCompare(b.col)
      })

      console.log('sortedCells', sortedCells)

      // 打印每个单元格的信息
      sortedCells.forEach(cell => {
        console.log(
          `单元格 ${cell.address} (${cell.col}列, 第${cell.row}行): ${cell.value}`
        )
      })

      // 示例：获取特定列的数据
      const columnB = cells.filter(cell => cell.col === 'B')
      console.log('\nB列的数据:')
      columnB.forEach(cell => {
        console.log(`B${cell.row}: ${cell.value}`)
      })
    } catch (error) {
      console.error('Failed to import Excel:', error)
    }
  }

  const handleExport = () => {
    // TODO: 实现Excel导出功能
    console.log('导出Excel')
  }

  return (
    <div className="excel-settings">
      <h2>Excel 导入导出</h2>

      <div className="excel-actions">
        <div className="action-section">
          <h3>导入 Excel</h3>
          <p>选择一个Excel文件进行导入</p>
          <button onClick={handleImport}>选择文件导入</button>
        </div>

        <div className="action-section">
          <h3>导出 Excel</h3>
          <p>将当前数据导出为Excel文件</p>
          <button onClick={handleExport}>导出为Excel</button>
        </div>
      </div>
    </div>
  )
}

export default ExcelSettings 