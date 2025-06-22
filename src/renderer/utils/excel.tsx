import * as XLSX from "xlsx";
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
  async getTableData(): Promise<XLSX.WorkBook | null> {
    try {
      // 打开文件选择对话框
      const result = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "Excel Files", extensions: ["xlsx", "xls"] }],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }

      // 读取文件内容
      const filePath = result.filePaths[0];
      // 分割出fileDir 和 fileName
      this.fileDir = filePath.split("/").slice(0, -1).join("/");
      this.fileName = filePath
        .split("/")
        .pop()
        ?.replace(/.xlsx|.xls$/, "");
      this.fileExt = filePath.split(".").pop() || "";
      const fileData = fs.readFileSync(filePath);
      const workbook = XLSX.read(fileData, { type: "buffer" });

      // 获取第一个工作表
      const firstSheetName = workbook.SheetNames[0];
      console.log(workbook);
      const worksheet = workbook.Sheets[firstSheetName];
      return workbook;

      // 获取工作表的有效范围
      // const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
      // const cells: CellData[] = [];

      // 遍历每个单元格
      // for (let R = range.s.r; R <= range.e.r; ++R) {
      //   for (let C = range.s.c; C <= range.e.c; ++C) {
      //     // 获取单元格地址（例如：'A1', 'B2'）
      //     const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      //     const cell = worksheet[cellAddress];

      //     if (cell) {
      //       // 获取列标识（A, B, C...）
      //       const colLetter = XLSX.utils.encode_col(C);

      //       cells.push({
      //         value: cell.v, // 单元格的值
      //         address: cellAddress,
      //         row: R + 1, // 转换为1-based行号
      //         col: colLetter,
      //       });
      //     }
      //   }
      // }

      // return cells;
    } catch (error) {
      console.error("Error reading Excel file:", error);
      throw error;
    }
  }

  saveToLocal(worksheet: any) {
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // 确保json目录存在
    const jsonDir = "./json";
    if (!fs.existsSync(jsonDir)) {
      fs.mkdirSync(jsonDir, { recursive: true });
    }

    // 生成文件名（使用时间戳避免重名）
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const jsonFileName = `excel_data_${timestamp}.json`;
    const jsonFilePath = `${jsonDir}/${jsonFileName}`;

    // 将数据写入json文件
    fs.writeFileSync(jsonFilePath, JSON.stringify(jsonData, null, 2));
    console.log(`Excel数据已保存到: ${jsonFilePath}`);
  }

  analyzeAndExport(workbook: any) {
    try {
      // 获取第一个工作表
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // 获取工作表的有效范围
      const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
      console.log(`工作表范围: ${range.s.r}-${range.e.r}, ${range.s.c}-${range.e.c}`);

      // 遍历每个单元格进行修改
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = worksheet[cellAddress];

          if (cell) {
            // B列（索引1）和H列（索引7）的商品名处理
            if ((C === 1 || C === 7) && cell.v && typeof cell.v === "string") {
              // 跳过表头行（前2行）和尾部行（最后几行）
              if (R >= 2 && R < range.e.r - 3) {
                // 如果商品名不以"（改）"结尾，则添加
                if (!cell.v.endsWith("（改）")) {
                  const oldValue = cell.v;
                  cell.v = cell.v + "（改）";
                  console.log(`商品名修改: ${cellAddress} "${oldValue}" -> "${cell.v}"`);
                }
              }
            }

            // D列（索引3）和J列（索引9）的单价处理
            if (C === 3 || C === 9) {
              // 跳过表头行（前2行）和尾部行（最后几行）
              if (R >= 2 && R < range.e.r - 3) {
                const oldValue = cell.v;
                // 将单价设置为99，无论原值是什么类型
                cell.v = 99;
                console.log(`单价修改: ${cellAddress} "${oldValue}" -> ${cell.v}`);
              }
            }
          }
        }
      }

      console.log(worksheet);

      // 确保输出目录存在
      const outputDir = "./output";
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // 生成输出文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const outputFileName = `modified_excel_${this.count++}.xlsx`;
      const outputFilePath = `${outputDir}/${outputFileName}`;

      // 将修改后的workbook写入Excel文件
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      fs.writeFileSync(outputFilePath, buffer);

      console.log(`修改后的Excel文件已保存到: ${outputFilePath}`);
    } catch (error) {
      console.error("Error analyzing and exporting Excel:", error);
      throw error;
    }
  }

  async priceSetBySheet(worksheet: any) {
    try {
      // 获取预设的价格数据
      const priceItems: PriceItem[] = await storageService.readData();
      console.log("预设价格数据:", priceItems);

      // 创建商品名到价格的映射
      const priceMap = new Map<string, number>();
      priceItems.forEach((item) => {
        priceMap.set(item.name, item.price);
      });

      // 获取工作表的有效范围
      const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
      console.log(`工作表范围: ${range.s.r}-${range.e.r}, ${range.s.c}-${range.e.c}`);

      // 遍历每个单元格进行修改
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          const cell = worksheet[cellAddress];

          if (cell) {
            // B列（索引1）和H列（索引7）的商品名处理
            if ((C === 1 || C === 7) && cell.v && typeof cell.v === "string") {
              // 跳过表头行（前2行）和尾部行（最后几行）
              if (R >= 2 && R < range.e.r - 3) {
                const productName = cell.v;

                // 检查是否在预设价格中
                if (priceMap.has(productName)) {
                  const presetPrice = priceMap.get(productName)!;

                  // 修改对应的单价列
                  const priceCol = C === 1 ? 3 : 9; // B列对应D列，H列对应J列
                  const priceCellAddress = XLSX.utils.encode_cell({ r: R, c: priceCol });
                  const priceCell = worksheet[priceCellAddress];

                  if (priceCell) {
                    const oldPrice = priceCell.v;
                    priceCell.v = presetPrice;
                    console.log(`价格修改: ${productName} ${priceCellAddress} ${oldPrice} -> ${presetPrice}`);
                  } else {
                    // 如果价格单元格不存在，创建一个新的
                    worksheet[priceCellAddress] = { v: presetPrice };
                    console.log(`创建价格单元格: ${productName} ${priceCellAddress} -> ${presetPrice}`);
                  }
                }
              }
            }
          }
        }
      }

      console.log("工作表价格设置完成");
    } catch (error) {
      console.error("Error setting prices by sheet:", error);
      throw error;
    }
  }

  async batchSetPrice(workbook: XLSX.WorkBook, sheetIndexes: number[]): Promise<XLSX.WorkBook> {
    try {
      // 创建workbook的副本，避免修改原始数据
      const newWorkbook = XLSX.utils.book_new();

      // 复制所有工作表
      workbook.SheetNames.forEach((sheetName, index) => {
        const worksheet = workbook.Sheets[sheetName];
        if (sheetIndexes.includes(index)) {
          // 对选中的工作表进行价格设置
          this.priceSetBySheet(worksheet);
        }
        // 将工作表添加到新的workbook中
        XLSX.utils.book_append_sheet(newWorkbook, worksheet, sheetName);
      });

      return newWorkbook;
    } catch (error) {
      console.error("Error in batch set price:", error);
      throw error;
    }
  }

  async exportExcel(workbook: XLSX.WorkBook | null) {
    if (!workbook) {
      console.log("没有可导出的工作簿");
      return;
    }

    try {
      // 生成默认文件名, 时间戳为 `2025-06-22_08-00`
      const curTimeStr =
        new Date().toLocaleDateString().replace(/\//g, "-") +
        "_" +
        new Date().toLocaleTimeString().replace(/:/g, "-");
      const defaultFileName = `${this.fileName}_${curTimeStr}.${this.fileExt}`;

      // 获取原始文件路径的目录作为默认保存位置
      const path = remote.require("path");
      const defaultPath = this.fileDir ? path.dirname(this.fileDir) : "";
      console.log("defaultPath", defaultPath);

      // 打开保存文件对话框
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

      // 将workbook写入文件
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      fs.writeFileSync(result.filePath, buffer);

      console.log(`Excel文件已保存到: ${result.filePath}`);

      // 可选：显示成功消息
      const { shell } = remote.require("electron");
      shell.showItemInFolder(result.filePath);
    } catch (error) {
      console.error("导出Excel文件失败:", error);
      throw error;
    }
  }
}

export const excelUtils = new ExcelUtils();
