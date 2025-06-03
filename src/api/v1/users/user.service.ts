import { User } from "@prisma/client";
import { CreateUserInput } from "./user.validator";
import userRepository from "./user.repository";
import { CustomError } from "../../../types/custom-errors";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import hasherUtils from "../../../utils/hasher.utils";
import { UserServiceInterface } from "./interfaces/user.service.interface";
import { UserRepositoryInterface } from "./interfaces/user.repository.interface";

class UserServices implements UserServiceInterface {
  constructor(private userRepository: UserRepositoryInterface) {}

  private async findByEmailOrFail(email: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email);
    if (user)
      throw new CustomError(
        `Email ${email} has already taken. Please another email.`,
        HttpStatus.CONFLICT,
        "EMAIL_CONFLICT",
      );
    return true;
  }

  private async findByIdOrFail(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user)
      throw new CustomError(
        `User wih ID ${id} not found .`,
        HttpStatus.NOT_FOUND,
        "ID_NOT_FOUND",
      );
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findById(id: string): Promise<User> {
    return this.findByIdOrFail(id);
  }

  async createUser(data: CreateUserInput): Promise<User> {
    await this.findByEmailOrFail(data.email);

    const hashedPass = hasherUtils.hash(data.password);
    const newUser = await this.userRepository.create({
      ...data,
      password: hashedPass,
    });
    const { password: _password, ...dataWithOutPassword } = newUser;
    return dataWithOutPassword as User;
  }
}

export default new UserServices(userRepository);
