import { Repository } from 'typeorm';
import { IAnalyticsService } from '../Domain/services/IAnalyticsService';
import { Receipt } from '../Domain/models/Receipt';
import { ReportAnalysis } from '../Domain/models/ReportAnalysis';
import {
  CreateReceiptDTO,
  CreateReportAnalysisDTO,
  TopTenSummaryDTO
} from '../Domain/DTOs';

export class AnalyticsService implements IAnalyticsService {
  constructor(
    private receiptRepository: Repository<Receipt>,
    private reportRepository: Repository<ReportAnalysis>
  ) {
    console.log('\x1b[36m[Analytics@1.0.0]\x1b[0m Service started');
  }

  async createReceipt(receiptData: CreateReceiptDTO): Promise<Receipt> {
    try {
      const newReceipt = this.receiptRepository.create(receiptData);
      const savedReceipt = await this.receiptRepository.save(newReceipt);
      console.log(`\x1b[36m[Analytics@1.0.0]\x1b[0m Receipt created with ID: ${savedReceipt.id}`);
      return savedReceipt;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error creating receipt:', error);
      throw error;
    }
  }

  async getReceipts(userId: number, startDate?: Date, endDate?: Date): Promise<Receipt[]> {
    try {
      const query = this.receiptRepository.createQueryBuilder('receipt').where('receipt.userId = :userId', {
        userId,
      });

      if (startDate) {
        query.andWhere('receipt.createdAt >= :startDate', { startDate });
      }

      if (endDate) {
        query.andWhere('receipt.createdAt <= :endDate', { endDate });
      }

      const receipts = await query.orderBy('receipt.createdAt', 'DESC').getMany();
      return receipts;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error fetching receipts:', error);
      throw error;
    }
  }

  async getReceiptById(id: number): Promise<Receipt | null> {
    try {
      const receipt = await this.receiptRepository.findOne({ where: { id } });
      return receipt || null;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error fetching receipt:', error);
      throw error;
    }
  }

  async deleteReceipt(id: number): Promise<boolean> {
    try {
      const result = await this.receiptRepository.delete(id);
      const isDeleted = (result.affected ?? 0) > 0;
      console.log(
        `\x1b[36m[Analytics@1.0.0]\x1b[0m Receipt ${id} ${isDeleted ? 'deleted' : 'not found'}`
      );
      return isDeleted;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error deleting receipt:', error);
      throw error;
    }
  }

  async createReportAnalysis(reportData: CreateReportAnalysisDTO): Promise<ReportAnalysis> {
    try {
      const newReport = this.reportRepository.create({
        ...reportData,
        pdfData: reportData.pdfData ?? '',
      });
      const savedReport = await this.reportRepository.save(newReport);
      console.log(`\x1b[36m[Analytics@1.0.0]\x1b[0m Report created with ID: ${savedReport.id}`);
      return savedReport;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error creating report:', error);
      throw error;
    }
  }

  async getReportAnalysisList(limit?: number): Promise<ReportAnalysis[]> {
    try {
      const query = this.reportRepository.createQueryBuilder('report').orderBy('report.createdAt', 'DESC');

      if (limit) {
        query.limit(limit);
      }

      const reports = await query.getMany();
      return reports;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error fetching reports:', error);
      throw error;
    }
  }

  async getReportAnalysisById(id: number): Promise<ReportAnalysis | null> {
    try {
      const report = await this.reportRepository.findOne({ where: { id } });
      return report || null;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error fetching report:', error);
      throw error;
    }
  }

  async deleteReportAnalysis(id: number): Promise<boolean> {
    try {
      const result = await this.reportRepository.delete(id);
      const isDeleted = (result.affected ?? 0) > 0;
      console.log(
        `\x1b[36m[Analytics@1.0.0]\x1b[0m Report ${id} ${isDeleted ? 'deleted' : 'not found'}`
      );
      return isDeleted;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error deleting report:', error);
      throw error;
    }
  }

  async updateReportAnalysisExportDate(id: number): Promise<boolean> {
    try {
      const result = await this.reportRepository.update(id, {
        exportedAt: new Date(),
      });
      const isUpdated = result.affected !== undefined && result.affected > 0;
      console.log(
        `\x1b[36m[Analytics@1.0.0]\x1b[0m Report ${id} export date ${isUpdated ? 'updated' : 'not found'}`
      );
      return isUpdated;
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error updating report:', error);
      throw error;
    }
  }

  async calculateSalesAnalysis(
    analysisType: 'monthly' | 'weekly' | 'yearly' | 'total',
    period?: string
  ): Promise<{
    totalSales: number;
    totalRevenue: number;
    period?: string;
  }> {
    try {
      const query = this.receiptRepository.createQueryBuilder('receipt');

      if (analysisType === 'monthly' && period) {
        const [year, month] = period.split('-');
        const startDate = new Date(`${year}-${month}-01`);
        const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        query.where('receipt.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      } else if (analysisType === 'yearly' && period) {
        const startDate = new Date(`${period}-01-01`);
        const endDate = new Date(parseInt(period) + 1, 0, 0);
        query.where('receipt.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      } else if (analysisType === 'weekly' && period) {
        const date = new Date(period);
        const day = date.getDay();
        const diff = date.getDate() - day;
        const startDate = new Date(date.setDate(diff));
        const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        query.where('receipt.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
      }

      const receipts = await query.getMany();

      const totalSales = receipts.reduce((sum, receipt) => {
        const receiptQty = receipt.perfumeDetails?.reduce((qtySum, detail) => {
          return qtySum + (typeof detail.quantity === 'number' ? detail.quantity : Number(detail.quantity) || 0);
        }, 0) ?? 0;
        return sum + receiptQty;
      }, 0);
      const totalRevenue = receipts.reduce((sum, receipt) => {
        return sum + parseFloat(receipt.totalAmount.toString());
      }, 0);

      return {
        totalSales,
        totalRevenue,
        period,
      };
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error calculating sales analysis:', error);
      throw error;
    }
  }

  async calculateTopTenPerfumes(): Promise<TopTenSummaryDTO> {
    try {
      const receipts = await this.receiptRepository.find();

      const perfumeMap = new Map<
        number,
        {
          perfumeId: number;
          perfumeName: string;
          quantity: number;
          revenue: number;
        }
      >();

      receipts.forEach((receipt) => {
        receipt.perfumeDetails.forEach((detail) => {
          if (perfumeMap.has(detail.perfumeId)) {
            const existing = perfumeMap.get(detail.perfumeId)!;
            existing.quantity += detail.quantity;
            existing.revenue += detail.totalPrice;
          } else {
            perfumeMap.set(detail.perfumeId, {
              perfumeId: detail.perfumeId,
              perfumeName: detail.perfumeName,
              quantity: detail.quantity,
              revenue: detail.totalPrice,
            });
          }
        });
      });

      const topTen = Array.from(perfumeMap.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);
      const totalRevenue = topTen.reduce((sum, item) => sum + item.revenue, 0);

      return {
        items: topTen,
        totalRevenue,
      };
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error calculating top ten perfumes:', error);
      throw error;
    }
  }

  async calculateSalesTrend(days: number = 30): Promise<
    Array<{
      date: string;
      sales: number;
      revenue: number;
    }>
  > {
    try {
      const receipts = await this.receiptRepository.find();

      const trendMap = new Map<
        string,
        {
          date: string;
          sales: number;
          revenue: number;
        }
      >();

      receipts.forEach((receipt) => {
        const dateStr = receipt.createdAt.toISOString().split('T')[0];
        if (trendMap.has(dateStr)) {
          const existing = trendMap.get(dateStr)!;
          const receiptQty = receipt.perfumeDetails?.reduce((qtySum, detail) => {
            return qtySum + (typeof detail.quantity === 'number' ? detail.quantity : Number(detail.quantity) || 0);
          }, 0) ?? 0;
          existing.sales += receiptQty;
          existing.revenue += parseFloat(receipt.totalAmount.toString());
        } else {
          const receiptQty = receipt.perfumeDetails?.reduce((qtySum, detail) => {
            return qtySum + (typeof detail.quantity === 'number' ? detail.quantity : Number(detail.quantity) || 0);
          }, 0) ?? 0;
          trendMap.set(dateStr, {
            date: dateStr,
            sales: receiptQty,
            revenue: parseFloat(receipt.totalAmount.toString()),
          });
        }
      });

      const trend = Array.from(trendMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return trend.slice(-days);
    } catch (error) {
      console.error('\x1b[31m[Analytics@1.0.0]\x1b[0m Error calculating sales trend:', error);
      throw error;
    }
  }
}
