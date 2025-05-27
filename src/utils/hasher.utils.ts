import bcrypt from "bcrypt";
import { config } from "../config";

export interface BcryptInterface {
  hash(password: string): string;
  comparePass(password: string, encrypted: string): Promise<boolean>;
}

class Bcrypt implements BcryptInterface {
  hash(password: string) {
    return bcrypt.hashSync(password, config.saltRounds);
  }

  async comparePass(password: string, encrypted: string) {
    return await bcrypt.compare(password, encrypted);
  }
}
export default new Bcrypt();
