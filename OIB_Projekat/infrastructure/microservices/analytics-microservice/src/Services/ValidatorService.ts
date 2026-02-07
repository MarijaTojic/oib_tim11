import { IValidatorService } from '../Domain/services/IValidatorService';
import { CreateReceiptDTO, CreateReportAnalysisDTO } from '../Domain/DTOs';

export class ValidatorService implements IValidatorService {
  validateReceipt(receipt: CreateReceiptDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

  
    if (!receipt.saleType) {
      errors.push('Sale type is required');
    } else if (!['retail', 'wholesale'].includes(receipt.saleType)) {
      errors.push('Invalid sale type. Must be "retail" or "wholesale"');
    }

    if (!receipt.paymentType) {
      errors.push('Payment type is required');
    } else if (!['cash', 'bank_transfer', 'card'].includes(receipt.paymentType)) {
      errors.push('Invalid payment type. Must be "cash", "bank_transfer", or "card"');
    }

 
    if (!receipt.perfumeDetails || !Array.isArray(receipt.perfumeDetails)) {
      errors.push('Perfume details must be an array');
    } else if (receipt.perfumeDetails.length === 0) {
      errors.push('At least one perfume detail is required');
    } else {
      receipt.perfumeDetails.forEach((detail: any, index: number) => {
        if (!detail.perfumeId || typeof detail.perfumeId !== 'number') {
          errors.push(`Perfume detail ${index + 1}: perfumeId is required and must be a number`);
        }
        if (!detail.perfumeName || typeof detail.perfumeName !== 'string') {
          errors.push(`Perfume detail ${index + 1}: perfumeName is required and must be a string`);
        }
        if (!detail.quantity || typeof detail.quantity !== 'number' || detail.quantity <= 0) {
          errors.push(`Perfume detail ${index + 1}: quantity must be a positive number`);
        }
        if (!detail.price || typeof detail.price !== 'number' || detail.price < 0) {
          errors.push(`Perfume detail ${index + 1}: price must be a non-negative number`);
        }
        if (detail.totalPrice === undefined || typeof detail.totalPrice !== 'number' || detail.totalPrice < 0) {
          errors.push(`Perfume detail ${index + 1}: totalPrice must be a non-negative number`);
        }
      });
    }

   
    if (!receipt.totalAmount || typeof receipt.totalAmount !== 'number' || receipt.totalAmount <= 0) {
      errors.push('Total amount must be a positive number');
    }

    if (!receipt.userId || typeof receipt.userId !== 'number') {
      errors.push('User ID is required and must be a number');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateReportAnalysis(report: CreateReportAnalysisDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    
    if (!report.reportName || typeof report.reportName !== 'string') {
      errors.push('Report name is required and must be a string');
    }

    if (!report.analysisType) {
      errors.push('Analysis type is required');
    } else if (!['monthly', 'weekly', 'yearly', 'total'].includes(report.analysisType)) {
      errors.push('Invalid analysis type. Must be "monthly", "weekly", "yearly", or "total"');
    }

    
    if (!report.salesData || typeof report.salesData !== 'object') {
      errors.push('Sales data is required and must be an object');
    } else {
      if (typeof report.salesData.totalSales !== 'number' || report.salesData.totalSales < 0) {
        errors.push('Sales data: totalSales must be a non-negative number');
      }
      if (typeof report.salesData.totalRevenue !== 'number' || report.salesData.totalRevenue < 0) {
        errors.push('Sales data: totalRevenue must be a non-negative number');
      }
    }

    if (report.topTenPerfumes && Array.isArray(report.topTenPerfumes)) {
      report.topTenPerfumes.forEach((perfume: any, index: number) => {
        if (typeof perfume.perfumeId !== 'number') {
          errors.push(`Top perfume ${index + 1}: perfumeId must be a number`);
        }
        if (typeof perfume.quantity !== 'number' || perfume.quantity < 0) {
          errors.push(`Top perfume ${index + 1}: quantity must be a non-negative number`);
        }
        if (typeof perfume.revenue !== 'number' || perfume.revenue < 0) {
          errors.push(`Top perfume ${index + 1}: revenue must be a non-negative number`);
        }
      });
    }

    
    if (report.salesTrend && Array.isArray(report.salesTrend)) {
      report.salesTrend.forEach((trend: any, index: number) => {
        if (!trend.date || typeof trend.date !== 'string') {
          errors.push(`Sales trend ${index + 1}: date is required and must be a string`);
        }
        if (typeof trend.sales !== 'number' || trend.sales < 0) {
          errors.push(`Sales trend ${index + 1}: sales must be a non-negative number`);
        }
        if (typeof trend.revenue !== 'number' || trend.revenue < 0) {
          errors.push(`Sales trend ${index + 1}: revenue must be a non-negative number`);
        }
      });
    }

    if (report.pdfData !== undefined && typeof report.pdfData !== 'string') {
      errors.push('PDF data must be a string when provided');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
