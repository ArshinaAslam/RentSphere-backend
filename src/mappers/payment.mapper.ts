import type { IPayment } from "../models/paymentModel";

export interface PaymentResponseDto {
  _id: string;
  leaseId: string;
  tenantId: string;
  tenantName: string;
  landlordName: string;
  landlordId: string;
  propertyId: string;
  propertyTitle: string;
  type: string;
  amount: number;
  platformFee: number;
  landlordAmount: number;
  status: string;
  dueDate?: string | undefined;
  paidAt?: string | undefined;
  razorpayOrderId?: string | undefined;
  month?: number | undefined;
  year?: number | undefined;
  notes?: string | undefined;
  createdAt: string;
}

interface PopulatedTenant {
  _id: string;
  firstName?: string;
  lastName?: string;
}

interface PopulatedProperty {
  _id: string;
  title?: string;
}

interface PopulatedLandlord {
  _id: string;
  firstName?: string;
  lastName?: string;
}

const isPopulatedTenant = (val: unknown): val is PopulatedTenant =>
  typeof val === "object" && val !== null && "_id" in val && "firstName" in val;

const isPopulatedLandlord = (val: unknown): val is PopulatedLandlord =>
  typeof val === "object" && val !== null && "_id" in val && "firstName" in val;

const isPopulatedProperty = (val: unknown): val is PopulatedProperty =>
  typeof val === "object" && val !== null && "_id" in val && "title" in val;

export class PaymentMapper {
  static toDto(payment: IPayment): PaymentResponseDto {
    const tenant = payment.tenantId as unknown;
    const property = payment.propertyId as unknown;
    const landlord = payment.landlordId as unknown;

    const tenantName = isPopulatedTenant(tenant)
      ? `${tenant.firstName ?? ""} ${tenant.lastName ?? ""}`.trim()
      : "";

    const landlordName = isPopulatedLandlord(landlord)
      ? `${landlord.firstName ?? ""} ${landlord.lastName ?? ""}`.trim()
      : "";

    const propertyTitle = isPopulatedProperty(property)
      ? (property.title ?? "")
      : "";

    return {
      _id: String(payment._id),
      leaseId: String(payment.leaseId),
      tenantId: isPopulatedTenant(tenant) ? String(tenant._id) : String(tenant),
      tenantName,
      landlordName,
      landlordId: String(payment.landlordId),
      propertyId: isPopulatedProperty(property)
        ? String(property._id)
        : String(property),
      propertyTitle,
      type: payment.type,
      amount: payment.amount,
      platformFee: payment.platformFee,
      landlordAmount: payment.landlordAmount,
      status: payment.status,
      dueDate: payment.dueDate
        ? new Date(payment.dueDate).toISOString()
        : undefined,
      paidAt: payment.paidAt
        ? new Date(payment.paidAt).toISOString()
        : undefined,
      month: payment.month,
      year: payment.year,
      notes: payment.notes,
      createdAt: new Date(payment.createdAt).toISOString(),
    };
  }

  static toDtoList(payments: IPayment[]): PaymentResponseDto[] {
    return payments.map((p) => PaymentMapper.toDto(p));
  }
}
