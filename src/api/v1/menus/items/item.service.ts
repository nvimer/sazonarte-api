import { MenuItem } from "@prisma/client";
import { ItemServiceInteface } from "./interfaces/item.service.interface";
import { CreateItemInput } from "./item.validator";
import { ItemRepositoryInterface } from "./interfaces/item.repository.interface";
import itemRepository from "./item.repository";

class ItemService implements ItemServiceInteface {
  constructor(private itemRepository: ItemRepositoryInterface) {}

  async createItem(data: CreateItemInput): Promise<MenuItem> {
    return await this.itemRepository.create(data);
  }
}

export default new ItemService(itemRepository);
