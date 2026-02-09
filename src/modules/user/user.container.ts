import UserService from "./services/implementation/UserService";
import { DI_TYPES } from "../../common/di/types"; 
 import { container } from "tsyringe";
import { UserController } from "./controllers/implementation/UserController";


container.registerSingleton(DI_TYPES.UserService,UserService)

export const userController = container.resolve(UserController)