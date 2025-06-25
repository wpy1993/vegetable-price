import * as ExcelJS from 'exceljs';
import { storageService, PriceItem } from "../services/storage";
const remote = require("@electron/remote");
const { dialog } = remote;
const fs = remote.require("fs");

interface CellData {
  value: any;
  address: string; // 例如: 'A1', 'B2' 等
  row: number; // 行号（从1开始）
  col: string; // 列标识（A, B, C...）
}

class ExcelUtils {
  count = 0;
  fileDir = "";
  fileName = "";
  fileExt = "";

  async getTableData(): Promise<ExcelJS.Workbook | null> {
    try {
      const result = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "Excel Files", extensions: ["xlsx", "xls"] }],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      const filePath = result.filePaths[0];
      // 分割出fileDir 和 fileName
      this.fileDir = filePath.split("/").slice(0, -1).join("/");
      this.fileName = filePath
        .split("/")
        .pop()
        ?.replace(/.xlsx|.xls$/, "");
      this.fileExt = filePath.split(".").pop() || "";

      // 先读取文件内容到 Buffer
      const fileBuffer = fs.readFileSync(filePath);

      // 使用 ExcelJS 从 Buffer 读取
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(fileBuffer);

      console.log("Workbook loaded:", workbook.worksheets.map(ws => ws.name));
      return workbook;

    } catch (error) {
      console.error("Error reading Excel file:", error);
      throw error;
    }
  }

  async priceSetBySheet(worksheet: ExcelJS.Worksheet) {
    try {
      // 获取预设的价格数据
      const priceItems: PriceItem[] = await storageService.readData();
      console.log("预设价格数据:", priceItems);

      // 创建商品名到价格的映射
      const priceMap = new Map<string, number>();
      priceItems.forEach((item) => {
        priceMap.set(item.name, item.price);
      });

      // 遍历工作表的每一行
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        // 跳过表头行（前2行）和尾部行（最后3行）
        if (rowNumber <= 2 || rowNumber > worksheet.rowCount - 3) {
          return;
        }

        // 检查B列（2）和H列（8）的商品名
        [2, 8].forEach(colNumber => {
          const productCell = row.getCell(colNumber);
          const productName = productCell.text;

          if (productName && priceMap.has(productName)) {
            const presetPrice = priceMap.get(productName)!;
            // B列对应D列（4），H列对应J列（10）
            const priceColNumber = colNumber === 2 ? 4 : 10;
            const priceCell = row.getCell(priceColNumber);

            // 保存原始值用于日志
            const oldPrice = priceCell.value;

            // 更新价格，保持原有格式
            priceCell.value = Number(presetPrice);

            console.log(`价格修改: ${productName} 在第${rowNumber}行 ${oldPrice} -> ${presetPrice}`);
          }
        });
      });

      console.log("工作表价格设置完成");
    } catch (error) {
      console.error("Error setting prices by sheet:", error);
      throw error;
    }
  }

  async batchSetPrice(workbook: ExcelJS.Workbook, sheetIndexes: number[]): Promise<ExcelJS.Workbook> {
    try {
      // ExcelJS 的 Workbook 是引用传递，直接修改即可
      for (const index of sheetIndexes) {
        const worksheet = workbook.worksheets[index];
        if (worksheet) {
          await this.priceSetBySheet(worksheet);
        }
      }
      return workbook;
    } catch (error) {
      console.error("Error in batch set price:", error);
      throw error;
    }
  }

  async exportExcel(workbook: ExcelJS.Workbook | null) {
    if (!workbook) {
      console.log("没有可导出的工作簿");
      return;
    }

    try {
      const curTimeStr =
        new Date().toLocaleDateString().replace(/\//g, "-") +
        "_" +
        new Date().toLocaleTimeString().replace(/:/g, "-");
      const defaultFileName = `${this.fileName}_${curTimeStr}.${this.fileExt}`;

      const path = remote.require("path");
      const defaultPath = this.fileDir ? path.dirname(this.fileDir) : "";

      const result = await dialog.showSaveDialog({
        title: "保存Excel文件",
        defaultPath: defaultPath ? path.join(defaultPath, defaultFileName) : defaultFileName,
        filters: [
          { name: "Excel Files", extensions: [this.fileExt] },
          { name: "All Files", extensions: ["*"] },
        ],
        properties: ["createDirectory"],
      });

      if (result.canceled || !result.filePath) {
        console.log("用户取消了保存操作");
        return;
      }

      // 使用 ExcelJS 写入到 Buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // 使用 fs 写入文件
      fs.writeFileSync(result.filePath, buffer);

      console.log(`Excel文件已保存到: ${result.filePath}`);

      const { shell } = remote.require("electron");
      shell.showItemInFolder(result.filePath);
    } catch (error) {
      console.error("导出Excel文件失败:", error);
      throw error;
    }
  }
}

export const excelUtils = new ExcelUtils();
