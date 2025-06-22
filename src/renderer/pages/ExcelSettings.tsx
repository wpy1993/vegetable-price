import React, { useState } from "react";
import XLSX from "xlsx";
import { excelUtils } from "../utils/excel";

const ExcelSettings: React.FC = () => {
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);

  const [sheetList, setSheetList] = useState<string[]>([]);

  const [sheetIndexes, setSheetIndexes] = useState<number[]>([]);

  const handleImport = async () => {
    try {
      const workbook: XLSX.WorkBook | null = await excelUtils.getTableData();
      setWorkbook(workbook);
      setSheetList(workbook?.SheetNames || []);
      // if (workbook) {
      //   excelUtils.analyzeAndExport(workbook);
      // }

      // 按行号和列标识排序
      // const sortedCells = cells.sort((a, b) => {
      //   if (a.row !== b.row) {
      //     return a.row - b.row
      //   }
      //   return a.col.localeCompare(b.col)
      // })

      // console.log('sortedCells', sortedCells)

      // // 打印每个单元格的信息
      // sortedCells.forEach(cell => {
      //   console.log(
      //     `单元格 ${cell.address} (${cell.col}列, 第${cell.row}行): ${cell.value}`
      //   )
      // })

      // // 示例：获取特定列的数据
      // const columnB = cells.filter(cell => cell.col === 'B')
      // console.log('\nB列的数据:')
      // columnB.forEach(cell => {
      //   console.log(`B${cell.row}: ${cell.value}`)
      // })
    } catch (error) {
      console.error("Failed to import Excel:", error);
    }
  };

  const handleExport = async () => {
    if (!workbook) {
      console.log("请先导入Excel文件");
      return;
    }

    try {
      await excelUtils.exportExcel(workbook);
    } catch (error) {
      console.error("导出Excel失败:", error);
    }
  };

  const handleSheetToggle = (index: number) => {
    setSheetIndexes((prev) => {
      if (prev.includes(index)) {
        // 如果已选中，则取消选择
        return prev.filter((i) => i !== index);
      } else {
        // 如果未选中，则添加选择
        return [...prev, index];
      }
    });
  };

  const handleSelectAll = () => {
    setSheetIndexes(sheetList.map((_, index) => index));
  };

  const handleClearAll = () => {
    setSheetIndexes([]);
  };

  const handleBatchSetPrice = async () => {
    if (workbook && sheetIndexes.length > 0) {
      try {
        const newWorkbook: XLSX.WorkBook = await excelUtils.batchSetPrice(workbook, sheetIndexes);
        setWorkbook(newWorkbook);
        console.log("批量价格设置完成");
      } catch (error) {
        console.error("批量价格设置失败:", error);
      }
    } else {
      console.log("请先选择要处理的工作表");
    }
  };

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

      {/* 工作表选择区域 */}
      {sheetList.length > 0 && (
        <div className="sheet-selection">
          <h3>选择工作表</h3>
          <div className="sheet-actions">
            <button onClick={handleSelectAll}>全选</button>
            <button onClick={handleClearAll}>清空</button>
            <button onClick={handleBatchSetPrice}>单价变更</button>
            <span className="selected-count">
              已选择: {sheetIndexes.length}/{sheetList.length}
            </span>
          </div>
          <div className="sheet-list">
            {sheetList.map((sheet, index) => (
              <div
                key={index}
                className={`sheet-item ${sheetIndexes.includes(index) ? "selected" : ""}`}
                onClick={() => handleSheetToggle(index)}
              >
                <input
                  type="checkbox"
                  checked={sheetIndexes.includes(index)}
                  onChange={() => handleSheetToggle(index)}
                />
                <span>{sheet}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelSettings;
