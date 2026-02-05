import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("catalogues")
export class Catalogue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("simple-json", { nullable: true })
  perfumeIds!: number[]; 

  @Column({ type: "int", default: 0 })
  amount!: number; 
}
