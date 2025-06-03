import { User } from "@prisma/client";
import { CreateUserInput, UpdateUserInput } from "./user.validator";
import userRepository from "./user.repository";
import { CustomError } from "../../../types/custom-errors";
import { HttpStatus } from "../../../utils/httpStatus.enum";
import hasherUtils from "../../../utils/hasher.utils";
import { UserServiceInterface } from "./interfaces/user.service.interface";
import { UserRepositoryInterface } from "./interfaces/user.repository.interface";
import { RoleServiceInterface } from "../roles/interfaces/role.service.interface";
import roleService from "../roles/role.service";

class UserServices implements UserServiceInterface {
  constructor(
    private userRepository: UserRepositoryInterface,
    private roleService: RoleServiceInterface,
  ) {}

  // Private function for find user by email, if this user exists, generate a custom error.
  // It's util in various functions, and is private because only can be used in this class
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

  // Private function for find user by id , if this user exists, generate a custom error.
  // It's util in various functions, and is private because only can be used in this class
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

  // This function is util for updateUser functionality. If an array of roleIds exist in the data (body) this function analyze and validate if roles are valids or not.
  // If user send no valid role id, this generate a Custon error, but if the ids od roles are valid, continues
  private async validateRoleIds(roleIds: number[]) {
    const uniqueRoleIds = [...new Set(roleIds)];

    const rolesExistPromises = uniqueRoleIds.map((id) =>
      this.roleService.findRoleById(id),
    );

    const existingRoles = await Promise.all(rolesExistPromises);

    const nonExistentRoleIds = uniqueRoleIds.filter(
      (id, index) => !existingRoles[index],
    );

    if (nonExistentRoleIds.length > 0)
      throw new CustomError(
        `One or mode role IDs are invalid: ${nonExistentRoleIds.join(", ")}.`,
        HttpStatus.BAD_REQUEST,
        "INVALID_ROLE_IDS",
      );
  }

  // This operation can be get all users of repository.
  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  // This operation can be get a user if the Id is valid.
  // The private function findByEmailOrFail is utilized here
  async findById(id: string): Promise<User> {
    return this.findByIdOrFail(id);
  }

  // This function can create a user, additionally pass the hash functionality for hashing and give more security to password. The underline is because the eslint mark as a alert for value not used
  async createUser(data: CreateUserInput): Promise<User> {
    // 1. We use private findByEmailOrFail function for verify if email exists and is used for other user, or is valide and continue.
    await this.findByEmailOrFail(data.email);

    // 2. Import hasherUtils with hash operation for script and blind the password string send for the user.
    const hashedPass = hasherUtils.hash(data.password);

    // 3. When all data is validate, send data to repository.
    const newUser = await this.userRepository.create({
      ...data,
      password: hashedPass,
    });

    // 4. if all works, a newUser has been create, destructure us a const  and extract password because we not want send this value
    const { password: _password, ...dataWithOutPassword } = newUser;

    // 5. Return dataWithOutPassword
    return dataWithOutPassword as User;
  }

  // This operation can update a user if send a valid id. Return a user with the new information
  async updateUser(id: string, data: UpdateUserInput): Promise<User> {
    // 1. First validate the id with the private function findByIdOrFail, if user exists, continue.
    await this.findByIdOrFail(id);

    // 2. Verify if data.email exists and validate if this email has been used for other user or is valid for change.
    if (data.email) await this.findByEmailOrFail(data.email);

    // 3. Finally, all data send to repository and return a user updated with new information
    return this.userRepository.update(id, data);
  }
}

export default new UserServices(userRepository, roleService);
