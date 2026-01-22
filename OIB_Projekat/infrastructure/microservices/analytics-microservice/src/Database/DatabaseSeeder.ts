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
          totalSales: 5,
          totalRevenue: 1644.86,
          period: '2026-01',
        },
        topTenPerfumes: [
          {
            perfumeId: 1,
            perfumeName: 'Eau de Parfum - Rose',
            quantity: 3,
            revenue: 269.97,
          },
          {
            perfumeId: 2,
            perfumeName: 'Cologne - Lavender',
            quantity: 4,
            revenue: 279.96,
          },
          {
            perfumeId: 3,
            perfumeName: 'Eau de Toilette - Jasmine',
            quantity: 15,
            revenue: 675.0,
          },
          {
            perfumeId: 4,
            perfumeName: 'Fragrance - Vanilla',
            quantity: 7,
            revenue: 419.93,
          },
        ],
        salesTrend: [
          {
            date: '2026-01-15',
            sales: 2,
            revenue: 459.94,
          },
          {
            date: '2026-01-16',
            sales: 1,
            revenue: 209.97,
          },
          {
            date: '2026-01-17',
            sales: 1,
            revenue: 524.95,
          },
          {
            date: '2026-01-18',
            sales: 1,
            revenue: 450.0,
          },
        ],
        pdfData: '',
        generatedBy: 'admin',
      },
      {
        reportName: 'Weekly Sales Analysis - Week 3 January 2026',
        analysisType: 'weekly',
        salesData: {
          totalSales: 3,
          totalRevenue: 984.89,
          period: '2026-01-13',
        },
        topTenPerfumes: [
          {
            perfumeId: 1,
            perfumeName: 'Eau de Parfum - Rose',
            quantity: 2,
            revenue: 179.98,
          },
          {
            perfumeId: 2,
            perfumeName: 'Cologne - Lavender',
            quantity: 3,
            revenue: 209.97,
          },
          {
            perfumeId: 3,
            perfumeName: 'Eau de Toilette - Jasmine',
            quantity: 10,
            revenue: 450.0,
          },
          {
            perfumeId: 4,
            perfumeName: 'Fragrance - Vanilla',
            quantity: 2,
            revenue: 119.98,
          },
        ],
        salesTrend: [
          {
            date: '2026-01-15',
            sales: 2,
            revenue: 459.94,
          },
          {
            date: '2026-01-16',
            sales: 1,
            revenue: 209.97,
          },
          {
            date: '2026-01-17',
            sales: 0,
            revenue: 0,
          },
          {
            date: '2026-01-18',
            sales: 0,
            revenue: 0,
          },
        ],
        pdfData: '',
        generatedBy: 'manager',
      },
      {
        reportName: 'Total Sales Analysis - All Time',
        analysisType: 'total',
        salesData: {
          totalSales: 5,
          totalRevenue: 1644.86,
        },
        topTenPerfumes: [
          {
            perfumeId: 3,
            perfumeName: 'Eau de Toilette - Jasmine',
            quantity: 15,
            revenue: 675.0,
          },
          {
            perfumeId: 2,
            perfumeName: 'Cologne - Lavender',
            quantity: 4,
            revenue: 279.96,
          },
          {
            perfumeId: 4,
            perfumeName: 'Fragrance - Vanilla',
            quantity: 7,
            revenue: 419.93,
          },
          {
            perfumeId: 1,
            perfumeName: 'Eau de Parfum - Rose',
            quantity: 3,
            revenue: 269.97,
          },
        ],
        salesTrend: [
          {
            date: '2026-01-15',
            sales: 2,
            revenue: 459.94,
          },
          {
            date: '2026-01-16',
            sales: 1,
            revenue: 209.97,
          },
          {
            date: '2026-01-17',
            sales: 1,
            revenue: 524.95,
          },
          {
            date: '2026-01-18',
            sales: 1,
            revenue: 450.0,
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
