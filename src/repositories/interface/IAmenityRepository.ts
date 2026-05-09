import type { IAmenity } from "../../models/amenityModel";

export interface IAmenityRepository {
  findPaginated(
    skip: number,
    limit: number,
    search: string,
  ): Promise<IAmenity[]>;
  countByFilter(search: string): Promise<number>;
  findById(id: string): Promise<IAmenity | null>;
  findByLabel(label: string): Promise<IAmenity | null>;
  createAmenity(data: Partial<IAmenity>): Promise<IAmenity>;
  updateById(id: string, data: Partial<IAmenity>): Promise<IAmenity | null>;
  deleteById(id: string): Promise<void>;
  findActive(): Promise<IAmenity[]>;
}
