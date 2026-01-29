export interface CreateSaleDTO {
  userId: number;
  perfumes: {
    perfumeId: number;
    quantity: number;
  }[];
}