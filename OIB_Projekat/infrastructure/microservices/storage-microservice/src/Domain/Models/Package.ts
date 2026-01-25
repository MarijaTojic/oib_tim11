import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
} from 'typeorm';
import { Warehouse } from './Warehouse';

export enum PackageStatus {
    PACKED = 'PACKED',
    SHIPPED = 'SHIPPED',
}

@Entity()
export class Package {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    senderAddress!: string;

    @Column({
        type: 'enum',
        enum: PackageStatus,
        default: PackageStatus.PACKED,
    })
    status!: PackageStatus;

    @ManyToOne(() => Warehouse, (warehouse) => warehouse.packages)
    warehouse!: Warehouse;
}
