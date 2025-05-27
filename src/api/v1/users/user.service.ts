import { User } from "@prisma/client";
import { CreateUserInput } from "./user.validator";
import userRepository, { UserRepositoryInterface } from "./user.repository";
import { CustomError } from "../../../types/custom-errors";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import hasherUtils from "../../../utils/hasher.utils";

export interface UserServiceInterface {
  createUser(data: CreateUserInput): Promise<User | undefined>;
}

class UserServices implements UserServiceInterface {
  constructor(private userRepository: UserRepositoryInterface) {}

  async createUser(data: CreateUserInput) {
    if (data.email) {
      const existingEmail = await this.userRepository.findByEmail(data.email);
      if (existingEmail)
        throw new CustomError(
          "Email already in use",
          HttpStatus.CONFLICT,
          "EMAIL_CONFLICT",
        );
      const hashedPass = hasherUtils.hash(data.password);
      const newUser = await this.userRepository.create({
        ...data,
        password: hashedPass,
      });
      const { password, ...dataWithOutPassword } = newUser;
      return dataWithOutPassword as User;
    }
  }
}

export default new UserServices(userRepository);
