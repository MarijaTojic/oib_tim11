import { TopPerfumeDTO } from "./TopPerfumeDTO";

export interface TopTenSummaryDTO {
  items: TopPerfumeDTO[];
  totalRevenue: number;
}
