import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { PerfumeType } from "../enums/PerfumeType";

// =========================
// Perfume Entity
// =========================
@Entity("perfumes")
export class Perfume {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "enum", enum: PerfumeType })
  type!: PerfumeType;

  @Column({ type: "int" })
  netQuantity!: number; 

  @Column({ type: "varchar", unique: true, length: 100 })
  serialNumber!: string; 

  @Column({ type: "int" })
  plantId!: number;

  @Column({ type: "date" })
  expirationDate!: Date;

  @ManyToOne(() => Catalogue, (catalogue) => catalogue.allPerfumes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "catalogueId" })
  catalogue!: Catalogue;
}

// =========================
// Catalogue Entity
// =========================
@Entity("catalogues")
export class Catalogue {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(() => Perfume, (perfume) => perfume.catalogue, { cascade: true })
  allPerfumes!: Perfume[];

  @Column({ type: "int", default: 0 })
  amount!: number; 
}
