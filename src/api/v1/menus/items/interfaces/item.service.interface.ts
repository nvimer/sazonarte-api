import { MenuItem } from "@prisma/client";
import { CreateItemInput } from "../item.validator";

export interface ItemServiceInteface {
  createItem(data: CreateItemInput): Promise<MenuItem>;
}
