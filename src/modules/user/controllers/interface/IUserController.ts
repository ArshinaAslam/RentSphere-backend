import { Request, Response } from 'express';

export interface IUserAdminController {
  getUsers(req: Request, res: Response): Promise<Response>;
  toggleUserStatus(req: Request, res: Response): Promise<Response>;
}
