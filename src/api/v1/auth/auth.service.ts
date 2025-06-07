import { User } from "@prisma/client";
import { LoginInput } from "./auth.validator";
import { AuthServiceInterface } from "./interfaces/auth.service.interface";
import { UserServiceInterface } from "../users/interfaces/user.service.interface";
import userService from "../users/user.service";
import hasherUtils from "../../../utils/hasher.utils";
import { CustomError } from "../../../types/custom-errors";
import { HttpStatus } from "../../../utils/httpStatus.enum";

class AuthService implements AuthServiceInterface {
  constructor(private userService: UserServiceInterface) {}

  // This service is capable of verify if email passed exists in database, and compare password with password saved in db.
  async login(data: LoginInput): Promise<User> {
    const user = await this.userService.findByEmail(data.email);

    if (!hasherUtils.comparePass(data.password, user.password))
      throw new CustomError(
        "Invalid credentials",
        HttpStatus.BAD_REQUEST,
        "BAD_REQUEST",
      );

    // decronstructed user for quit password and not exposed.
    const { password: _password, ...userData } = user;
    return userData as User;
  }
}

export default new AuthService(userService);
