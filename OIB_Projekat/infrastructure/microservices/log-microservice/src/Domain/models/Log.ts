import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { LogInfo } from "../enums/Log";

@Entity("audit_logovi")
export class Log {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  description!: string;

  @Column({type: "enum", enum: LogInfo, default: LogInfo.INFO })
  logtype!: LogInfo;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  datetime!: Date;
}
