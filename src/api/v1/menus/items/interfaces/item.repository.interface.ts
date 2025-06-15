import { MenuItem } from "@prisma/client";
import { CreateItemInput } from "../item.validator";

export interface ItemRepositoryInterface {
  create(data: CreateItemInput): Promise<MenuItem>;
}
