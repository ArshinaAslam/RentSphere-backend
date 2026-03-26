import { injectable, inject } from "tsyringe";

import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import {
  LandlordPropertyMapper,
  LeaseMapper,
  TenantSearchMapper,
} from "../../../mappers/lease.mapper";
import { IConversationRepository } from "../../../repositories/interface/IConversationRepository";
import { IPropertyRepository } from "../../../repositories/interface/IPropertyRepository";
import { ITenantRepository } from "../../../repositories/interface/ITenantRepository";
import logger from "../../../utils/logger";

import type {
  CreateLeaseDto,
  GetLeasesResultDto,
  LandlordPropertyDto,
  signLandlordLeaseDto,
  TenantSearchResultDto,
  UpdateLeaseDto,
} from "../../../dto/landlord/landlord.lease.dto";
import type { LeaseResponseDto } from "../../../mappers/lease.mapper";
import type { ILeaseRepository } from "../../../repositories/interface/ILeaseRepository";
import type { ILandlordLeaseService } from "../../interface/landlord/ILandlordLeaseService";

@injectable()
export class LandlordLeaseService implements ILandlordLeaseService {
  constructor(
    @inject(DI_TYPES.LeaseRepository)
    private _leaseRepo: ILeaseRepository,
    @inject(DI_TYPES.TenantRepository)
    private _tenantRepo: ITenantRepository,
    @inject(DI_TYPES.ConversationRepository)
    private _convRepo: IConversationRepository,
    @inject(DI_TYPES.PropertyRepository)
    private _propertyRepo: IPropertyRepository,
  ) {}

  async createLease(
    dto: CreateLeaseDto,
    landlordId: string,
  ): Promise<LeaseResponseDto> {
    logger.info("Creating lease", { landlordId, propertyId: dto.propertyId });

    const lease = await this._leaseRepo.create({
      propertyId: dto.propertyId,
      landlordId: landlordId,
      tenantId: dto.tenantId,
      rentAmount: dto.rentAmount,
      securityDeposit: dto.securityDeposit,
      paymentDueDay: dto.paymentDueDay,
      lateFee: dto.lateFee ?? 0,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      leaseType: dto.leaseType,
      petsAllowed: dto.petsAllowed ?? false,
      smokingAllowed: dto.smokingAllowed ?? false,
      maxOccupants: dto.maxOccupants ?? 1,
      noticePeriod: dto.noticePeriod ?? 30,
      utilitiesIncluded: dto.utilitiesIncluded ?? [],
      termsAndConditions: dto.termsAndConditions ?? "",
      status: "draft",
    });

    logger.info("Lease created", { leaseId: String(lease._id) });
    return LeaseMapper.toDto(lease);
  }

  async updateLease(
    leaseId: string,
    dto: UpdateLeaseDto,
    landlordId: string,
  ): Promise<LeaseResponseDto> {
    const lease = await this._leaseRepo.findById(leaseId);
    if (!lease) throw new AppError("Lease not found", HttpStatus.NOT_FOUND);
    const leaseLandlordId =
      typeof lease.landlordId === "object" &&
      lease.landlordId !== null &&
      "_id" in lease.landlordId
        ? String((lease.landlordId as { _id: string })._id)
        : String(lease.landlordId);
    if (leaseLandlordId !== landlordId)
      throw new AppError("Unauthorized", HttpStatus.FORBIDDEN);
    if (lease.status !== "draft")
      throw new AppError(
        "Only draft leases can be edited",
        HttpStatus.BAD_REQUEST,
      );

    const updated = await this._leaseRepo.updateLease(leaseId, {
      ...(dto.rentAmount !== undefined && { rentAmount: dto.rentAmount }),
      ...(dto.securityDeposit !== undefined && {
        securityDeposit: dto.securityDeposit,
      }),
      ...(dto.paymentDueDay !== undefined && {
        paymentDueDay: dto.paymentDueDay,
      }),
      ...(dto.lateFee !== undefined && { lateFee: dto.lateFee }),
      ...(dto.startDate !== undefined && {
        startDate: new Date(dto.startDate),
      }),
      ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
      ...(dto.leaseType !== undefined && { leaseType: dto.leaseType }),
      ...(dto.petsAllowed !== undefined && { petsAllowed: dto.petsAllowed }),
      ...(dto.smokingAllowed !== undefined && {
        smokingAllowed: dto.smokingAllowed,
      }),
      ...(dto.maxOccupants !== undefined && { maxOccupants: dto.maxOccupants }),
      ...(dto.noticePeriod !== undefined && { noticePeriod: dto.noticePeriod }),
      ...(dto.utilitiesIncluded !== undefined && {
        utilitiesIncluded: dto.utilitiesIncluded,
      }),
      ...(dto.termsAndConditions !== undefined && {
        termsAndConditions: dto.termsAndConditions,
      }),
    });

    if (!updated) throw new AppError("Lease not found", HttpStatus.NOT_FOUND);
    return LeaseMapper.toDto(updated);
  }

  async sendLease(
    leaseId: string,
    landlordId: string,
  ): Promise<LeaseResponseDto> {
    const lease = await this._leaseRepo.findById(leaseId);
    if (!lease) throw new AppError("Lease not found", HttpStatus.NOT_FOUND);
    const leaseLandlordId =
      typeof lease.landlordId === "object" &&
      lease.landlordId !== null &&
      "_id" in lease.landlordId
        ? String((lease.landlordId as { _id: string })._id)
        : String(lease.landlordId);
    if (leaseLandlordId !== landlordId)
      throw new AppError("Unauthorized", HttpStatus.FORBIDDEN);
    if (lease.status !== "draft")
      throw new AppError(
        "Only draft leases can be sent",
        HttpStatus.BAD_REQUEST,
      );

    const updated = await this._leaseRepo.updateStatus(leaseId, "sent", {
      sentAt: new Date(),
    });

    if (!updated) throw new AppError("Lease not found", HttpStatus.NOT_FOUND);
    logger.info("Lease sent to tenant", {
      leaseId,
      tenantId: String(lease.tenantId),
    });
    return LeaseMapper.toDto(updated);
  }

  async getLandlordLeases(
    landlordId: string,
    page: number,
    limit: number,
    search: string,
  ): Promise<GetLeasesResultDto> {
    const skip = (page - 1) * limit;

    const [leases, total] = await Promise.all([
      this._leaseRepo.findLeaseByLandlordId(landlordId, skip, limit, search),
      this._leaseRepo.countByLandlordId(landlordId, search),
    ]);

    logger.info("Landlord leases fetched", {
      landlordId,
      page,
      limit,
      count: leases.length,
    });

    return {
      leases: LeaseMapper.toDtoList(leases),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLeaseById(
    leaseId: string,
    landlordId: string,
  ): Promise<LeaseResponseDto> {
    const lease = await this._leaseRepo.findById(leaseId);
    if (!lease) throw new AppError("Lease not found", HttpStatus.NOT_FOUND);
    const leaseLandlordId =
      typeof lease.landlordId === "object" &&
      lease.landlordId !== null &&
      "_id" in lease.landlordId
        ? String((lease.landlordId as { _id: string })._id)
        : String(lease.landlordId);

    if (leaseLandlordId !== landlordId)
      throw new AppError("Unauthorized", HttpStatus.FORBIDDEN);
    return LeaseMapper.toDto(lease);
  }

  async terminateLease(
    leaseId: string,
    landlordId: string,
  ): Promise<LeaseResponseDto> {
    const lease = await this._leaseRepo.findById(leaseId);
    if (!lease) throw new AppError("Lease not found", HttpStatus.NOT_FOUND);

    const leaseLandlordId =
      typeof lease.landlordId === "object" &&
      lease.landlordId !== null &&
      "_id" in lease.landlordId
        ? String((lease.landlordId as { _id: string })._id)
        : String(lease.landlordId);

    if (leaseLandlordId !== landlordId)
      throw new AppError("Unauthorized", HttpStatus.FORBIDDEN);
    if (!["signed", "active"].includes(lease.status))
      throw new AppError(
        "Only signed or active leases can be terminated",
        HttpStatus.BAD_REQUEST,
      );

    const updated = await this._leaseRepo.updateStatus(leaseId, "terminated");
    if (!updated) throw new AppError("Lease not found", HttpStatus.NOT_FOUND);
    logger.info("Lease terminated", { leaseId });
    return LeaseMapper.toDto(updated);
  }

  async deleteLease(leaseId: string, landlordId: string): Promise<void> {
    const lease = await this._leaseRepo.findById(leaseId);
    if (!lease) throw new AppError("Lease not found", HttpStatus.NOT_FOUND);
    const leaseLandlordId =
      typeof lease.landlordId === "object" &&
      lease.landlordId !== null &&
      "_id" in lease.landlordId
        ? String((lease.landlordId as { _id: string })._id)
        : String(lease.landlordId);
    if (leaseLandlordId !== landlordId)
      throw new AppError("Unauthorized", HttpStatus.FORBIDDEN);
    if (lease.status !== "draft")
      throw new AppError(
        "Only draft leases can be deleted",
        HttpStatus.BAD_REQUEST,
      );

    await this._leaseRepo.deleteLease(leaseId);
    logger.info("Lease deleted", { leaseId });
  }

  async signLease(
    leaseId: string,
    landlordId: string,
    dto: signLandlordLeaseDto,
  ): Promise<LeaseResponseDto> {
    const lease = await this._leaseRepo.findById(leaseId);
    if (!lease) throw new AppError("Lease not found", HttpStatus.NOT_FOUND);

    const leaseLandlordId =
      typeof lease.landlordId === "object" &&
      lease.landlordId !== null &&
      "_id" in lease.landlordId
        ? String((lease.landlordId as { _id: string })._id)
        : String(lease.landlordId);

    if (leaseLandlordId !== landlordId)
      throw new AppError("Unauthorized", HttpStatus.FORBIDDEN);

    if (lease.status !== "signed")
      throw new AppError(
        "Landlord can only sign after tenant has signed",
        HttpStatus.BAD_REQUEST,
      );

    const updated = await this._leaseRepo.updateStatus(leaseId, "active", {
      landlordSignature: {
        name: dto.signatureName,
        signedAt: new Date(),
      },
    });

    if (!updated) throw new AppError("Lease not found", HttpStatus.NOT_FOUND);
    logger.info("Lease signed by landlord — now active", { leaseId });
    return LeaseMapper.toDto(updated);
  }

  async searchTenants(
    query: string,
    landlordId: string,
  ): Promise<TenantSearchResultDto[]> {
    const conversations = await this._convRepo.findByLandlordId(landlordId);

    const tenantIds = [
      ...new Set(
        conversations.map((c) => {
          const tenantId = c.tenantId as unknown as { _id: string };
          return String(tenantId._id);
        }),
      ),
    ];

    if (tenantIds.length === 0) return [];

    const tenants = await this._tenantRepo.searchByQuery(query, tenantIds);

    return TenantSearchMapper.toDtoList(tenants);
  }

  async getLandlordProperties(
    landlordId: string,
  ): Promise<LandlordPropertyDto[]> {
    const properties =
      await this._propertyRepo.findAllPropertyByLandlordId(landlordId);
    return LandlordPropertyMapper.toDtoList(properties);
  }
}
