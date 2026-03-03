
import type { IVisitBooking } from "../models/visitBookingModel";

interface TenantSummary {
  id:        string;
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
  avatar:    string;
}

interface PropertySummary {
  id:      string;
  title:   string;
  address: string;
  city:    string;
  images:  string[];
}


interface PopulatedTenant {
  _id:       unknown;
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
  avatar:    string;
}


interface PopulatedProperty {
  _id:     unknown;
  title:   string;
  address: string;
  city:    string;
  images:  string[];
}

export interface VisitBookingResponseDto {
  _id:        string;
  propertyId: string | PropertySummary;
  tenantId:   string | TenantSummary;
  landlordId: string;
  date:       string;
  timeSlot:   string;
  status:     string;
  createdAt:  string;
}


export class VisitBookingMapper {

  static toResponseDto(visit: IVisitBooking): VisitBookingResponseDto {

    // Map tenantId
    const tenantId = visit.tenantId;
    const isPopulatedTenant =
      typeof tenantId === "object" &&
      tenantId !== null &&
      "firstName" in (tenantId as object);

    const mappedTenant: string | TenantSummary = isPopulatedTenant
      ? {
          id:        String((tenantId as PopulatedTenant)._id),
          firstName: (tenantId as PopulatedTenant).firstName ?? "",
          lastName:  (tenantId as PopulatedTenant).lastName  ?? "",
          email:     (tenantId as PopulatedTenant).email     ?? "",
          phone:     (tenantId as PopulatedTenant).phone     ?? "",
          avatar:    (tenantId as PopulatedTenant).avatar    ?? "",
        }
      : String(tenantId);

    // Map propertyId
    const propertyId = visit.propertyId;
    const isPopulatedProperty =
      typeof propertyId === "object" &&
      propertyId !== null &&
      "title" in (propertyId as object);

    const mappedProperty: string | PropertySummary = isPopulatedProperty
      ? {
          id:      String((propertyId as PopulatedProperty)._id),
          title:   (propertyId as PopulatedProperty).title   ?? "",
          address: (propertyId as PopulatedProperty).address ?? "",
          city:    (propertyId as PopulatedProperty).city    ?? "",
          images:  (propertyId as PopulatedProperty).images  ?? [],
        }
      : String(propertyId);

    return {
      _id:        String(visit._id),
      propertyId: mappedProperty,
      tenantId:   mappedTenant,
      landlordId: String(visit.landlordId),
      date:       visit.date,
      timeSlot:   visit.timeSlot,
      status:     visit.status,
      createdAt:  visit.createdAt.toISOString(),
    };
  }

  static toResponseDtoList(visits: IVisitBooking[]): VisitBookingResponseDto[] {
    return visits.map((v) => VisitBookingMapper.toResponseDto(v));
  }
}