import cron from "node-cron";
import { container } from "tsyringe";

import { DI_TYPES } from "../common/di/types";
import logger from "../utils/logger";
import { createAndEmitNotification } from "../utils/notificationEmitter";

import type { ILeaseRepository } from "../repositories/interface/ILeaseRepository";
import type { IPaymentRepository } from "../repositories/interface/IPaymentRepository";

async function activateDueLeases(): Promise<void> {
  const leaseRepo = container.resolve<ILeaseRepository>(
    DI_TYPES.LeaseRepository,
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const signedLeases = await leaseRepo.find({
    status: "signed",
    startDate: { $lte: today },
  });

  for (const lease of signedLeases) {
    await leaseRepo.updateLease(String(lease._id), { status: "active" });
    logger.info("Lease activated by cron", { leaseId: String(lease._id) });
  }
}

async function expireDueLeases(): Promise<void> {
  const leaseRepo = container.resolve<ILeaseRepository>(
    DI_TYPES.LeaseRepository,
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeLeases = await leaseRepo.find({
    status: "active",
    endDate: { $lte: today },
  });

  for (const lease of activeLeases) {
    await leaseRepo.updateLease(String(lease._id), { status: "expired" });
    logger.info("Lease expired by cron", { leaseId: String(lease._id) });
  }
}

async function generateMonthlyRentPayments(): Promise<void> {
  const leaseRepo = container.resolve<ILeaseRepository>(
    DI_TYPES.LeaseRepository,
  );
  const paymentRepo = container.resolve<IPaymentRepository>(
    DI_TYPES.PaymentRepository,
  );

  const today = new Date();
  const todayDate = today.getDate();
  const thisMonth = today.getMonth() + 1;
  const thisYear = today.getFullYear();

  const activeLeases = await leaseRepo.find({
    status: "active",
    paymentDueDay: todayDate,
  });

  for (const lease of activeLeases) {
    const leaseId = String(lease._id);

    const payments = await paymentRepo.findByLeaseId(leaseId);
    const depositPaid = payments.some(
      (p) => p.type === "deposit" && p.status === "completed",
    );

    if (!depositPaid) {
      logger.warn("Skipping rent generation — deposit not paid", { leaseId });
      continue;
    }

    const rentExists = payments.some(
      (p) => p.type === "rent" && p.month === thisMonth && p.year === thisYear,
    );

    if (rentExists) {
      logger.info("Rent already exists for this month", {
        leaseId,
        thisMonth,
        thisYear,
      });
      continue;
    }

    const amount = lease.rentAmount;
    const platformFee = 0;
    const landlordAmount = amount - platformFee;
    const dueDate = new Date(thisYear, thisMonth - 1, lease.paymentDueDay);

    const landlordId =
      typeof lease.landlordId === "object" && lease.landlordId !== null
        ? String((lease.landlordId as { _id: string })._id)
        : String(lease.landlordId);

    const propertyId =
      typeof lease.propertyId === "object" && lease.propertyId !== null
        ? String((lease.propertyId as { _id: string })._id)
        : String(lease.propertyId);

    const tenantId =
      typeof lease.tenantId === "object" && lease.tenantId !== null
        ? String((lease.tenantId as { _id: string })._id)
        : String(lease.tenantId);

    await paymentRepo.createPayment({
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

    logger.info("Rent payment generated", {
      leaseId,
      month: thisMonth,
      year: thisYear,
      amount,
    });

    await createAndEmitNotification({
      recipientId: tenantId,
      recipientRole: "tenant",
      type: "rent_due",
      title: "Rent Payment Due",
      message: `Your rent of ₹${amount.toLocaleString("en-IN")} is due for ${new Date(thisYear, thisMonth - 1).toLocaleString("en-IN", { month: "long" })} ${thisYear}.`,
      link: "/tenant/payments",
    });
  }
}

async function applyLateFees(): Promise<void> {
  const leaseRepo = container.resolve<ILeaseRepository>(
    DI_TYPES.LeaseRepository,
  );
  const paymentRepo = container.resolve<IPaymentRepository>(
    DI_TYPES.PaymentRepository,
  );

  const today = new Date();
  const todayDate = today.getDate();
  const thisMonth = today.getMonth() + 1;
  const thisYear = today.getFullYear();

  const activeLeases = await leaseRepo.find({ status: "active" });

  for (const lease of activeLeases) {
    if (lease.lateFee <= 0) continue;

    const leaseId = String(lease._id);
    const graceCutoffDay = lease.paymentDueDay + (lease.gracePeriodDays ?? 5);

    if (todayDate !== graceCutoffDay) continue;

    const payments = await paymentRepo.findByLeaseId(leaseId);

    const rentPending = payments.some(
      (p) =>
        p.type === "rent" &&
        p.status === "pending" &&
        p.month === thisMonth &&
        p.year === thisYear,
    );

    if (!rentPending) continue;

    const lateFeeExists = payments.some(
      (p) =>
        p.type === "late_fee" && p.month === thisMonth && p.year === thisYear,
    );

    if (lateFeeExists) continue;

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

    await paymentRepo.createPayment({
      leaseId,
      tenantId,
      landlordId,
      propertyId,
      type: "late_fee",
      amount: lease.lateFee,
      platformFee: 0,
      landlordAmount: lease.lateFee,
      status: "pending",
      month: thisMonth,
      year: thisYear,
    });

    logger.info("Late fee applied", { leaseId, amount: lease.lateFee });

    await createAndEmitNotification({
      recipientId: tenantId,
      recipientRole: "tenant",
      type: "late_fee",
      title: "Late Fee Applied",
      message: `A late fee of ₹${lease.lateFee.toLocaleString("en-IN")} has been added because rent was not paid on time.`,
      link: "/tenant/payments",
    });
  }
}

export function startCronJobs(): void {
  cron.schedule("0 0 * * *", async () => {
    logger.info("Cron started", { time: new Date().toISOString() });
    try {
      await activateDueLeases();
      await expireDueLeases();
      await generateMonthlyRentPayments();
      await applyLateFees();
      logger.info("Cron completed successfully");
    } catch (err) {
      logger.error("Cron job failed", { err });
    }
  });

  logger.info("Cron jobs registered");
}
