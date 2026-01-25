import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
} from 'typeorm';
import { Package } from './Package';

@Entity()
export class Warehouse {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    location!: string;

    @Column()
    maxPackages!: number;

    @OneToMany(() => Package, (pkg) => pkg.warehouse)
    packages!: Package[];
}
