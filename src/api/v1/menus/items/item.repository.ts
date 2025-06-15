import { MenuItem } from "@prisma/client";
import { ItemRepositoryInterface } from "./interfaces/item.repository.interface";
import { CreateItemInput } from "./item.validator";
import prisma from "../../../../database/prisma";

class ItemRepository implements ItemRepositoryInterface {
  async create(data: CreateItemInput): Promise<MenuItem> {
    return await prisma.menuItem.create({ data });
  }
}

export default new ItemRepository();
