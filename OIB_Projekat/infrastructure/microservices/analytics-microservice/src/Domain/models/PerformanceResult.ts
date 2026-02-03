import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum LogisticsAlgorithm {
  DIJKSTRA = 'dijkstra',
  ASTAR = 'astar',
  GENETIC_ALGORITHM = 'genetic_algorithm',
  ANT_COLONY = 'ant_colony',
  PARTICLE_SWARM = 'particle_swarm'
}

interface AlgorithmMetrics {
  executionTime: number; // milliseconds
  distanceCovered: number; // kilometers
  costOptimization: number; // percentage
  pathEfficiency: number; // percentage (0-100)
  memoryUsage: number; // MB
  successRate: number; // percentage (0-100)
}

@Entity('izvestaji_performanse')
export class PerformanceResult {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: LogisticsAlgorithm })
  algorithm!: LogisticsAlgorithm;

  @Column({ type: 'varchar', length: 255 })
  simulationName!: string;

  @Column({ type: 'int', default: 1 })
  numberOfSimulations!: number;

  @Column({ type: 'int', default: 100 })
  numberOfParticles!: number;

  @Column({ type: 'int', default: 50 })
  numberOfIterations!: number;

  @Column({ type: 'json' })
  metrics!: AlgorithmMetrics;

  @Column({ type: 'json', nullable: true })
  comparisonWithOthers?: {
    [key in LogisticsAlgorithm]?: AlgorithmMetrics;
  };

  @Column({ type: 'longtext', nullable: true })
  analysisConclusions!: string | null;

  @Column({ type: 'longtext', nullable: true })
  detailedReport!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  generatedBy!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  exportedAt!: Date | null;
}
