import { Repository } from 'typeorm';
import { Receipt } from '../Domain/models/Receipt';
import { ReportAnalysis } from '../Domain/models/ReportAnalysis';
import { SaleType } from '../Domain/enums/SaleType';
import { PaymentType } from '../Domain/enums/PaymentType';

export class DatabaseSeeder {
  constructor(private receiptRepository: Repository<Receipt>, private reportRepository: Repository<ReportAnalysis>) {}

  async seed(): Promise<void> {
    const receiptsCount = await this.receiptRepository.count();
    const reportsCount = await this.reportRepository.count();

    if (receiptsCount === 0) {
      await this.seedReceipts();
      console.log('\x1b[36m[Seeder@1.0.0]\x1b[0m Receipts seeded successfully');
    }

    if (reportsCount === 0) {
      await this.seedReports();
      console.log('\x1b[36m[Seeder@1.0.0]\x1b[0m Reports seeded successfully');
    }
  }

  private async seedReceipts(): Promise<void> {
    const receipts: Partial<Receipt>[] = [
      {
        saleType: SaleType.RETAIL,
        paymentType: PaymentType.CARD,
        perfumeDetails: [
          {
            perfumeId: 1,
            perfumeName: 'Eau de Parfum - Rose',
            quantity: 2,
            price: 89.99,
            totalPrice: 179.98,
          },
          {
            perfumeId: 2,
            perfumeName: 'Cologne - Lavender',
            quantity: 1,
            price: 69.99,
            totalPrice: 69.99,
          },
        ],
        totalAmount: 249.97,
        userId: 1,
      },
      {
        saleType: SaleType.WHOLESALE,
        paymentType: PaymentType.BANK_TRANSFER,
        perfumeDetails: [
          {
            perfumeId: 3,
            perfumeName: 'Eau de Toilette - Jasmine',
            quantity: 10,
            price: 45.0,
            totalPrice: 450.0,
          },
        ],
        totalAmount: 450.0,
        userId: 2,
      },
      {
        saleType: SaleType.RETAIL,
        paymentType: PaymentType.CASH,
        perfumeDetails: [
          {
            perfumeId: 1,
            perfumeName: 'Eau de Parfum - Rose',
            quantity: 1,
            price: 89.99,
            totalPrice: 89.99,
          },
          {
            perfumeId: 4,
            perfumeName: 'Fragrance - Vanilla',
            quantity: 2,
            price: 59.99,
            totalPrice: 119.98,
          },
        ],
        totalAmount: 209.97,
        userId: 3,
      },
      {
        saleType: SaleType.RETAIL,
        paymentType: PaymentType.CARD,
        perfumeDetails: [
          {
            perfumeId: 2,
            perfumeName: 'Cologne - Lavender',
            quantity: 3,
            price: 69.99,
            totalPrice: 209.97,
          },
        ],
        totalAmount: 209.97,
        userId: 1,
      },
      {
        saleType: SaleType.WHOLESALE,
        paymentType: PaymentType.BANK_TRANSFER,
        perfumeDetails: [
          {
            perfumeId: 3,
            perfumeName: 'Eau de Toilette - Jasmine',
            quantity: 5,
            price: 45.0,
            totalPrice: 225.0,
          },
          {
            perfumeId: 4,
            perfumeName: 'Fragrance - Vanilla',
            quantity: 5,
            price: 59.99,
            totalPrice: 299.95,
          },
        ],
        totalAmount: 524.95,
        userId: 2,
      },
    ];

    for (const receipt of receipts) {
      await this.receiptRepository.save(receipt);
    }
  }

  private async seedReports(): Promise<void> {
    const reports: Partial<ReportAnalysis>[] = [
      {
        reportName: 'Monthly Sales Analysis - January 2026',
        analysisType: 'monthly',
        salesData: {
          totalSales: 192,
          totalRevenue: 2127400,
          period: '2026-01',
        },
        topTenPerfumes: [
          {
            perfumeId: 1,
            perfumeName: 'Eau de Parfum - Rose',
            quantity: 42,
            revenue: 356800,
          },
          {
            perfumeId: 2,
            perfumeName: 'Cologne - Lavender',
            quantity: 36,
            revenue: 298400,
          },
          {
            perfumeId: 3,
            perfumeName: 'Eau de Toilette - Jasmine',
            quantity: 31,
            revenue: 410500,
          },
          {
            perfumeId: 4,
            perfumeName: 'Fragrance - Vanilla',
            quantity: 27,
            revenue: 321700,
          },
        ],
        salesTrend: [
          {
            date: '2026-01-14',
            sales: 18,
            revenue: 185000,
          },
          {
            date: '2026-01-15',
            sales: 22,
            revenue: 245000,
          },
          {
            date: '2026-01-16',
            sales: 19,
            revenue: 198000,
          },
          {
            date: '2026-01-17',
            sales: 27,
            revenue: 312000,
          },
          {
            date: '2026-01-18',
            sales: 24,
            revenue: 284000,
          },
          {
            date: '2026-01-19',
            sales: 35,
            revenue: 472000,
          },
          {
            date: '2026-01-20',
            sales: 29,
            revenue: 431400,
          },
        ],
        pdfData: '',
        generatedBy: 'admin',
      },
      {
        reportName: 'Weekly Sales Analysis - Week 3 January 2026',
        analysisType: 'weekly',
        salesData: {
          totalSales: 108,
          totalRevenue: 1164200,
          period: '2026-01-13',
        },
        topTenPerfumes: [
          {
            perfumeId: 1,
            perfumeName: 'Eau de Parfum - Rose',
            quantity: 24,
            revenue: 205200,
          },
          {
            perfumeId: 2,
            perfumeName: 'Cologne - Lavender',
            quantity: 21,
            revenue: 179600,
          },
          {
            perfumeId: 3,
            perfumeName: 'Eau de Toilette - Jasmine',
            quantity: 18,
            revenue: 234000,
          },
          {
            perfumeId: 4,
            perfumeName: 'Fragrance - Vanilla',
            quantity: 15,
            revenue: 168400,
          },
        ],
        salesTrend: [
          {
            date: '2026-01-14',
            sales: 12,
            revenue: 128000,
          },
          {
            date: '2026-01-15',
            sales: 14,
            revenue: 142500,
          },
          {
            date: '2026-01-16',
            sales: 13,
            revenue: 136000,
          },
          {
            date: '2026-01-17',
            sales: 16,
            revenue: 188000,
          },
          {
            date: '2026-01-18',
            sales: 15,
            revenue: 172000,
          },
          {
            date: '2026-01-19',
            sales: 20,
            revenue: 228500,
          },
          {
            date: '2026-01-20',
            sales: 18,
            revenue: 169200,
          },
        ],
        pdfData: '',
        generatedBy: 'manager',
      },
      {
        reportName: 'Total Sales Analysis - All Time',
        analysisType: 'total',
        salesData: {
          totalSales: 642,
          totalRevenue: 7423900,
        },
        topTenPerfumes: [
          {
            perfumeId: 3,
            perfumeName: 'Eau de Toilette - Jasmine',
            quantity: 168,
            revenue: 2146000,
          },
          {
            perfumeId: 2,
            perfumeName: 'Cologne - Lavender',
            quantity: 142,
            revenue: 1862000,
          },
          {
            perfumeId: 4,
            perfumeName: 'Fragrance - Vanilla',
            quantity: 126,
            revenue: 1678000,
          },
          {
            perfumeId: 1,
            perfumeName: 'Eau de Parfum - Rose',
            quantity: 98,
            revenue: 1165000,
          },
        ],
        salesTrend: [
          {
            date: '2026-01-14',
            sales: 90,
            revenue: 1040000,
          },
          {
            date: '2026-01-15',
            sales: 96,
            revenue: 1165000,
          },
          {
            date: '2026-01-16',
            sales: 92,
            revenue: 1108000,
          },
          {
            date: '2026-01-17',
            sales: 108,
            revenue: 1320000,
          },
          {
            date: '2026-01-18',
            sales: 102,
            revenue: 1260000,
          },
          {
            date: '2026-01-19',
            sales: 124,
            revenue: 1492000,
          },
          {
            date: '2026-01-20',
            sales: 130,
            revenue: 1705900,
          },
        ],
        pdfData: '',
        generatedBy: 'admin',
      },
    ];

    for (const report of reports) {
      await this.reportRepository.save(report);
    }
  }
}
