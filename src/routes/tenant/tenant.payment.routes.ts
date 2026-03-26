import { Router } from "express";
import { container } from "tsyringe";

import { TenantPaymentController } from "../../controllers/implementation/tenant/tenant.payment.controller";
import { asyncHandler } from "../../middleware/asyncHandler";
import { authenticateToken } from "../../middleware/auth.middleware";
import { tenantOnly } from "../../middleware/role.middleware";

const router = Router();
const tenantPaymentController = container.resolve(TenantPaymentController);

router.post(
  "/deposit/order",
  authenticateToken,
  tenantOnly,
  asyncHandler(
    tenantPaymentController.createDepositOrder.bind(tenantPaymentController),
  ),
);

router.post(
  "/rent/order",
  authenticateToken,
  tenantOnly,
  asyncHandler(
    tenantPaymentController.createRentOrder.bind(tenantPaymentController),
  ),
);

router.post(
  "/verify",
  authenticateToken,
  tenantOnly,
  asyncHandler(
    tenantPaymentController.verifyPayment.bind(tenantPaymentController),
  ),
);

router.get(
  "/payment-history",
  authenticateToken,
  tenantOnly,
  asyncHandler(
    tenantPaymentController.getTenantPayments.bind(tenantPaymentController),
  ),
);

// GET /tenant/payments/lease/:leaseId
// router.get(
//   "/tenant/payments/lease/:leaseId",
//   authenticateToken,
//   tenantOnly,
//   asyncHandler(
//     tenantPaymentController.getLeasePayments.bind(tenantPaymentController),
//   ),
// );

export default router;
