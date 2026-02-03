import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { PerfumeType } from "../enums/PerfumeType";

@Entity("parfemi")
export class Perfume {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({type: "enum", enum: PerfumeType, default: PerfumeType.PERFUME })
  type!: PerfumeType;

  @Column({ type: "int"})
  netQuantity!: number;

 @Column({ type: "varchar", unique: true, length: 100, nullable: true })
  serialNumber!: string;

  @Column({ type: "int"})
  plantId!: number;

  @Column({ type: "timestamp"})
  expirationDate!: Date;

  @Column({ type: "int", nullable: true})
  perfumeAromaticOilStrength!: number;
}
