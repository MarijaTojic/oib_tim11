import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("catalogues") 
export class Catalogue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  perfume_name!: string;

  @Column({ type: "int", default: 0 })
  perfume_quantity!: number;
}
