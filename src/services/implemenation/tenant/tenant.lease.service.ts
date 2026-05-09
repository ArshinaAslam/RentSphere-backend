import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../../common/constants/statusMessages";
import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { LeaseMapper } from "../../../mappers/lease.mapper";
import logger from "../../../utils/logger";
import { createAndEmitNotification } from "../../../utils/notificationEmitter";

import type { SignLeaseDto } from "../../../dto/tenant/tenant.lease.dto";
import type { LeaseResponseDto } from "../../../mappers/lease.mapper";
import type { ILeaseRepository } from "../../../repositories/interface/ILeaseRepository";
import type { ITenantLeaseService } from "../../interface/tenant/ITenantLeaseService";

@injectable()
export class TenantLeaseService implements ITenantLeaseService {
  constructor(
    @inject(DI_TYPES.LeaseRepository)
    private _leaseRepo: ILeaseRepository,
  ) {}

  async getTenantLeases(tenantId: string): Promise<LeaseResponseDto[]> {
    const leases = await this._leaseRepo.findByTenantId(tenantId);
    return LeaseMapper.toDtoList(leases);
  }

  async getLeaseById(
    leaseId: string,
    tenantId: string,
  ): Promise<LeaseResponseDto> {
    const lease = await this._leaseRepo.findById(leaseId);
    if (!lease)
      throw new AppError(MESSAGES.LEASE.NOT_FOUND, HttpStatus.NOT_FOUND);

    const leaseTenantId =
      typeof lease.tenantId === "object" &&
      lease.tenantId !== null &&
      "_id" in lease.tenantId
        ? String((lease.tenantId as { _id: string })._id)
        : String(lease.landlordId);

    if (leaseTenantId !== tenantId)
      throw new AppError(MESSAGES.LEASE.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    return LeaseMapper.toDto(lease);
  }

  async markAsViewed(
    leaseId: string,
    tenantId: string,
  ): Promise<LeaseResponseDto> {
    const lease = await this._leaseRepo.findById(leaseId);
    if (!lease)
      throw new AppError(MESSAGES.LEASE.NOT_FOUND, HttpStatus.NOT_FOUND);

    const leaseTenantId =
      typeof lease.tenantId === "object" &&
      lease.tenantId !== null &&
      "_id" in lease.tenantId
        ? String((lease.tenantId as { _id: string })._id)
        : String(lease.landlordId);

    if (leaseTenantId !== tenantId)
      throw new AppError(MESSAGES.LEASE.UNAUTHORIZED, HttpStatus.FORBIDDEN);

    if (lease.status === "sent") {
      const updated = await this._leaseRepo.updateStatus(leaseId, "viewed", {
        viewedAt: new Date(),
      });
      if (!updated)
        throw new AppError(MESSAGES.LEASE.NOT_FOUND, HttpStatus.NOT_FOUND);
      return LeaseMapper.toDto(updated);
    }

    return LeaseMapper.toDto(lease);
  }

  async signLease(
    leaseId: string,
    tenantId: string,
    dto: SignLeaseDto,
  ): Promise<LeaseResponseDto> {
    const lease = await this._leaseRepo.findById(leaseId);
    if (!lease)
      throw new AppError(MESSAGES.LEASE.NOT_FOUND, HttpStatus.NOT_FOUND);

    const leaseTenantId =
      typeof lease.tenantId === "object" &&
      lease.tenantId !== null &&
      "_id" in lease.tenantId
        ? String((lease.tenantId as { _id: string })._id)
        : String(lease.landlordId);

    if (leaseTenantId !== tenantId)
      throw new AppError(MESSAGES.LEASE.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    if (!["sent", "viewed"].includes(lease.status))
      throw new AppError(
        MESSAGES.LEASE.INVALID_STATUS_SIGN,
        HttpStatus.BAD_REQUEST,
      );

    const updated = await this._leaseRepo.updateStatus(leaseId, "signed", {
      tenantSignature: {
        name: dto.signatureName,
        signedAt: new Date(),
      },
      signedAt: new Date(),
    });

    if (!updated)
      throw new AppError(MESSAGES.LEASE.NOT_FOUND, HttpStatus.NOT_FOUND);
    logger.info("Lease signed by tenant", { leaseId, tenantId });
    const landlordId =
      typeof lease.landlordId === "object" && lease.landlordId !== null
        ? String((lease.landlordId as { _id: string })._id)
        : String(lease.landlordId);

    await createAndEmitNotification({
      recipientId: landlordId,
      recipientRole: "landlord",
      type: "lease_signed",
      title: "Tenant Signed the Lease",
      message:
        "Your tenant has signed the lease agreement. Please review and counter-sign.",
      link: `/landlord/leases/${leaseId}`,
    });

    await createAndEmitNotification({
      recipientId: tenantId,
      recipientRole: "tenant",
      type: "lease_signed",
      title: "Security Deposit Payment Required",
      message: `You have signed the lease. Please pay your security deposit of ₹${lease.securityDeposit.toLocaleString("en-IN")} to proceed.`,
      link: "/tenant/payments",
    });
    return LeaseMapper.toDto(updated);
  }
}
