import type { Request, Response } from "express";

export interface IAdminTenantController {
  getTenants(req: Request, res: Response): Promise<Response>;
  toggleTenantStatus(req: Request, res: Response): Promise<Response>;
}
