import { injectable, inject } from "tsyringe";

import { MESSAGES } from "../../../common/constants/statusMessages";
import { DI_TYPES } from "../../../common/di/types";
import { HttpStatus } from "../../../common/enums/httpStatus.enum";
import { AppError } from "../../../common/errors/appError";
import { PLATFORM_FEE_PERCENT } from "../../../config/razorPay";
import {
  LandlordPropertyMapper,
  LeaseMapper,
  TenantSearchMapper,
} from "../../../mappers/lease.mapper";
import { IConversationRepository } from "../../../repositories/interface/IConversationRepository";
import { IPaymentRepository } from "../../../repositories/interface/IPaymentRepository";
import { IPropertyRepository } from "../../../repositories/interface/IPropertyRepository";
import { ITenantRepository } from "../../../repositories/interface/ITenantRepository";
import logger from "../../../utils/logger";
import { createAndEmitNotification } from "../../../utils/notificationEmitter";

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
    @inject(DI_TYPES.PaymentRepository)
    private _paymentRepo: IPaymentRepository,
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
    if (!lease)
      throw new AppError(MESSAGES.LEASE.NOT_FOUND, HttpStatus.NOT_FOUND);
    const leaseLandlordId =
      typeof lease.landlordId === "object" &&
      lease.landlordId !== null &&
      "_id" in lease.landlordId
        ? String((lease.landlordId as { _id: string })._id)
        : String(lease.landlordId);
    if (leaseLandlordId !== landlordId)
      throw new AppError(MESSAGES.LEASE.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    if (lease.status !== "draft")
      throw new AppError(
        MESSAGES.LEASE.ONLY_DRAFT_EDIT,
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

    if (!updated)
      throw new AppError(MESSAGES.LEASE.NOT_FOUND, HttpStatus.NOT_FOUND);
    return LeaseMapper.toDto(updated);
  }

  async sendLease(
    leaseId: string,
    landlordId: string,
  ): Promise<LeaseResponseDto> {
    const lease = await this._leaseRepo.findById(leaseId);
    if (!lease)
      throw new AppError(MESSAGES.LEASE.NOT_FOUND, HttpStatus.NOT_FOUND);
    const leaseLandlordId =
      typeof lease.landlordId === "object" &&
      lease.landlordId !== null &&
      "_id" in lease.landlordId
        ? String((lease.landlordId as { _id: string })._id)
        : String(lease.landlordId);
    if (leaseLandlordId !== landlordId)
      throw new AppError(MESSAGES.LEASE.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    if (lease.status !== "draft")
      throw new AppError(
        MESSAGES.LEASE.ONLY_DRAFT_SEND,
        HttpStatus.BAD_REQUEST,
      );

    const updated = await this._leaseRepo.updateStatus(leaseId, "sent", {
      sentAt: new Date(),
    });

    if (!updated)
      throw new AppError(MESSAGES.LEASE.NOT_FOUND, HttpStatus.NOT_FOUND);
    logger.info("Lease sent to tenant", {
      leaseId,
      tenantId: String(lease.tenantId),
    });
    const tenantId =
      typeof lease.tenantId === "object" && lease.tenantId !== null
        ? String((lease.tenantId as { _id: string })._id)
        : String(lease.tenantId);

    await createAndEmitNotification({
      recipientId: tenantId,
      recipientRole: "tenant",
      type: "lease_sent",
      title: "New Lease to Review",
      message:
        "Your landlord has sent you a lease agreement to review and sign.",
      link: "/tenant/my-lease",
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
    if (!lease)
      throw new AppError(MESSAGES.LEASE.NOT_FOUND, HttpStatus.NOT_FOUND);
    const leaseLandlordId =
      typeof lease.landlordId === "object" &&
      lease.landlordId !== null &&
      "_id" in lease.landlordId
        ? String((lease.landlordId as { _id: string })._id)
        : String(lease.landlordId);

    if (leaseLandlordId !== landlordId)
      throw new AppError(MESSAGES.LEASE.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    return LeaseMapper.toDto(lease);
  }

  async terminateLease(
    leaseId: string,
    landlordId: string,
  ): Promise<LeaseResponseDto> {
    const lease = await this._leaseRepo.findById(leaseId);
    if (!lease)
      throw new AppError(MESSAGES.LEASE.NOT_FOUND, HttpStatus.NOT_FOUND);

    const leaseLandlordId =
      typeof lease.landlordId === "object" &&
      lease.landlordId !== null &&
      "_id" in lease.landlordId
        ? String((lease.landlordId as { _id: string })._id)
        : String(lease.landlordId);

    if (leaseLandlordId !== landlordId)
      throw new AppError(MESSAGES.LEASE.UNAUTHORIZED, HttpStatus.FORBIDDEN);
    if (!["signed", "active"].includes(lease.status))
      throw new AppError(
        MESSAGES.LEASE.TERMINATE_INVALID,
        HttpStatus.BAD_REQUEST,
      );

    const updated = await this._leaseRepo.updateStatus(leaseId, "terminated");
    if (!updated)
      throw new AppError(MESSAGES.LEASE.NOT_FOUND, HttpStatus.NOT_FOUND);
    logger.info("Lease terminated", { leaseId });
    return LeaseMapper.toDto(updated);
  }

  async deleteLease(leaseId: string, landlordId: string): Promise<void> {
    const lease = await this._leaseRepo.findById(leaseId);
    if (!lease)
      throw new AppError(MESSAGES.LEASE.NOT_FOUND, HttpStatus.NOT_FOUND);
    const leaseLandlordId =
      typeof lease.landlordId === "object" &&
      lease.landlordId !== null &&
      "_id" in lease.landlordId
        ? String((lease.landlordId as { _id: string })._id)
        : String(lease.landlordId);
    if (leaseLandlordId !== landlordId)
      throw new AppError(MESSAGES.LEASE.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
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
    if (!lease)
      throw new AppError(MESSAGES.LEASE.NOT_FOUND, HttpStatus.NOT_FOUND);

    const leaseLandlordId =
      typeof lease.landlordId === "object" &&
      lease.landlordId !== null &&
      "_id" in lease.landlordId
        ? String((lease.landlordId as { _id: string })._id)
        : String(lease.landlordId);

    if (leaseLandlordId !== landlordId)
      throw new AppError(MESSAGES.LEASE.UNAUTHORIZED, HttpStatus.FORBIDDEN);

    if (lease.status !== "signed")
      throw new AppError(
        MESSAGES.LEASE.LANDLORD_SIGN_INVALID,
        HttpStatus.BAD_REQUEST,
      );

    const updated = await this._leaseRepo.updateStatus(leaseId, "active", {
      landlordSignature: {
        name: dto.signatureName,
        signedAt: new Date(),
      },
    });

    if (!updated)
      throw new AppError(MESSAGES.LEASE.NOT_FOUND, HttpStatus.NOT_FOUND);
    logger.info("Lease signed by landlord — now active", { leaseId });
    const tenantId =
      typeof lease.tenantId === "object" && lease.tenantId !== null
        ? String((lease.tenantId as { _id: string })._id)
        : String(lease.tenantId);
    await createAndEmitNotification({
      recipientId: tenantId,
      recipientRole: "tenant",
      type: "lease_active",
      title: "Your Lease is Now Active",
      message: "Both parties have signed. Your lease is now active.",
      link: "/tenant/my-lease",
    });
    await this.generateFirstRentIfActive(leaseId);
    await createAndEmitNotification({
      recipientId: tenantId,
      recipientRole: "tenant",
      type: "lease_active",
      title: "Lease Active — First Rent Due",
      message: `Your lease is now active. Your first rent payment of ₹${lease.rentAmount.toLocaleString("en-IN")} is ready to pay.`,
      link: "/tenant/payments",
    });
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

  private async generateFirstRentIfActive(leaseId: string): Promise<void> {
    const lease = await this._leaseRepo.findById(leaseId);
    if (!lease || lease.status !== "active") return;

    const payments = await this._paymentRepo.findByLeaseId(leaseId);
    const depositPaid = payments.some(
      (p) => p.type === "deposit" && p.status === "completed",
    );
    if (!depositPaid) {
      logger.info(
        "Lease activated but deposit not paid yet — skipping rent generation",
        { leaseId },
      );
      return;
    }

    const today = new Date();
    const thisMonth = today.getMonth() + 1;
    const thisYear = today.getFullYear();

    const rentExists = payments.some(
      (p) => p.type === "rent" && p.month === thisMonth && p.year === thisYear,
    );
    if (rentExists) return;

    const amount = lease.rentAmount;
    const platformFee = Math.round(amount * (PLATFORM_FEE_PERCENT / 100));
    const landlordAmount = amount - platformFee;
    const dueDate = new Date(thisYear, thisMonth - 1, lease.paymentDueDay);

    const tenantId =
      typeof lease.tenantId === "object" && lease.tenantId !== null
        ? String((lease.tenantId as { _id: string })._id)
        : String(lease.tenantId);

    const landlordId =
      typeof lease.landlordId === "object" && lease.landlordId !== null
        ? String((lease.landlordId as { _id: string })._id)
        : String(lease.landlordId);

    const propertyId =
      typeof lease.propertyId === "object" && lease.propertyId !== null
        ? String((lease.propertyId as { _id: string })._id)
        : String(lease.propertyId);

    await this._paymentRepo.createPayment({
      leaseId,
      tenantId,
      landlordId,
      propertyId,
      type: "rent",
      amount,
      platformFee,
      landlordAmount,
      status: "pending",
      dueDate,
      month: thisMonth,
      year: thisYear,
    });

    logger.info("First rent generated after landlord signed", {
      leaseId,
      thisMonth,
      thisYear,
    });
  }
}
