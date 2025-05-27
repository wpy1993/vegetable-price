import React from 'react'
import { excelUtils } from '../utils/excel'

const ExcelSettings: React.FC = () => {
  const handleImport = async () => {
    try {
      const data = await excelUtils.getTableData()
      // 遍历并打印每一行数据
      data.forEach((row, index) => {
        console.log(`Row ${index + 1}:`, row)
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