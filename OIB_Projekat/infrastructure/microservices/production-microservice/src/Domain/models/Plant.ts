import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { PlantStatus } from "../enums/PlantStatus";

@Entity()
export class Plant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  commonName!: string;

  @Column()
  latinName!: string;

  @Column("float")
  aromaticOilStrength!: number;

  @Column()
  countryOfOrigin!: string;

  @Column({
    type: "enum",
    enum: PlantStatus
  })
  status!: PlantStatus;
}
