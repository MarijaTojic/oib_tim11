import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { PackagingStatus } from "../enums/PackagingStatus";

@Entity("ambalaze")
export class Packaging {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({type: "varchar", length: 1000})
  senderAddress!: string;

  @Column({ type: "int"})
  storageID!: number;

 @Column({ type: "varchar"})
  perfumeList!: string[];

  @Column({ type: "enum", enum: PackagingStatus, default: PackagingStatus.PACKED })
  status!: PackagingStatus;

  @Column({ type: "timestamp"})
  expirationDate!: Date;
}
