import React, { useState } from "react";
import * as ExcelJS from 'exceljs';
import { excelUtils } from "../utils/excel";
import Button from 'antd/es/button';
import Card from 'antd/es/card';
import Checkbox from 'antd/es/checkbox';
import Space from 'antd/es/space';
import message from 'antd/es/message';
import Typography from 'antd/es/typography';
import Row from 'antd/es/row';
import Col from 'antd/es/col';
import Spin from 'antd/es/spin';
import { UploadOutlined, DownloadOutlined, CheckOutlined, ClearOutlined, DollarOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ExcelSettings: React.FC = () => {
  const [workbook, setWorkbook] = useState<ExcelJS.Workbook | null>(null);
  const [sheetList, setSheetList] = useState<string[]>([]);
  const [sheetIndexes, setSheetIndexes] = useState<number[]>([]);
  const [changeTimes, setChangeTimes] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);

  const handleImport = async () => {
    try {
      setLoading(true)
      const workbook = await excelUtils.getTableData();
      if (workbook) {
        setWorkbook(workbook);
        setSheetList(workbook.worksheets.map(ws => ws.name));
        setSheetIndexes([]);
        setChangeTimes(0);
        console.log('workbook is', workbook);
        setLoading(false)
        message.success('Excel文件导入成功');
      }
    } catch (error) {
      setLoading(false)
      console.error("Failed to import Excel:", error);
      message.error('Excel文件导入失败');
    }
  };

  const handleExport = async () => {
    if (!workbook) {
      message.warning("请先导入Excel文件");
      return;
    }

    try {
      setLoading(true)
      await excelUtils.exportExcel(workbook);
      setLoading(false)
      message.success('Excel文件导出成功');
    } catch (error) {
      setLoading(false)
      console.error("导出Excel失败:", error);
      message.error('Excel文件导出失败');
    }
  };

  const handleSheetToggle = (index: number) => {
    setSheetIndexes((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
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
    if (!workbook) {
      message.warning("请先导入Excel文件");
      return;
    }

    if (sheetIndexes.length === 0) {
      message.warning("请选择要处理的工作表");
      return;
    }

    try {
      setLoading(true)
      const newWorkbook = await excelUtils.batchSetPrice(workbook, sheetIndexes);
      setWorkbook(newWorkbook);
      setChangeTimes(changeTimes + 1)
      setLoading(false)
      message.success("批量价格设置完成");
    } catch (error) {
      setLoading(false)
      console.error("批量价格设置失败:", error);
      message.error("批量价格设置失败");
    }
  };

  return (
    <Spin spinning={loading}>
      <div className="excel-settings">
        <Title level={2}>Excel 导入导出</Title>

        <Row gutter={24}>
          <Col span={12}>
            <Card title="导入 Excel" bordered={false}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Typography.Text>选择一个Excel文件进行导入</Typography.Text>
                <Button
                  type="primary"
                  icon={<UploadOutlined />}
                  onClick={handleImport}
                  size="large"
                  block
                >
                  选择文件导入
                </Button>
              </Space>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="导出 Excel" bordered={false}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Typography.Text>将当前数据导出为Excel文件</Typography.Text>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  size="large"
                  block
                  disabled={!workbook}
                >
                  导出为Excel
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {sheetList.length > 0 && (
          <Card title="选择工作表" style={{ marginTop: 24 }}>
            <Space style={{ marginBottom: 16 }}>
              <Button
                icon={<CheckOutlined />}
                onClick={handleSelectAll}
              >
                全选
              </Button>
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearAll}
              >
                清空
              </Button>
              <Button
                type="primary"
                icon={<DollarOutlined />}
                onClick={handleBatchSetPrice}
                disabled={sheetIndexes.length === 0}
              >
                单价变更
              </Button>
              <Typography.Text type="secondary" style={{ color: 'yellowgreen' }}>
                操作次数: {changeTimes}次
              </Typography.Text>

              <Typography.Text type="secondary">
                已选择: {sheetIndexes.length}/{sheetList.length}
              </Typography.Text>
              {/* 变更次数 */}

            </Space>

            <Row gutter={[16, 16]}>
              {sheetList.map((sheet, index) => (
                <Col span={6} key={index}>
                  <Card
                    size="small"
                    hoverable
                    className={sheetIndexes.includes(index) ? 'sheet-item selected' : 'sheet-item'}
                    onClick={() => handleSheetToggle(index)}
                  >
                    <Checkbox checked={sheetIndexes.includes(index)}>
                      {sheet}
                    </Checkbox>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}
      </div>
    </Spin>
  );
};

export default ExcelSettings;
