import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { PlantStatus } from "../enums/PlantStatus";

@Entity("plants")
export class Plant {
  @PrimaryGeneratedColumn()
  id!: number; 

  @Column({ type: "varchar", length: 100 })
  commonName!: string; 

  @Column({ type: "varchar", length: 100, default: "" })
  latinName!: string; 

  @Column({ type: "float", default: 1.0 })
  aromaticOilStrength!: number; 

  @Column({ type: "varchar", length: 100, default: "" })
  countryOfOrigin!: string; 

  @Column({ type: "int", default: 1 })
  quantity!: number; 

  @Column({
    type: "enum",
    enum: PlantStatus,
    default: PlantStatus.PLANTED
  })
  status!: PlantStatus; 
}
