import contactPersonApiService from "@/lib/api/contactPersonApiService";
import { useBaseEntity } from "./useBaseEntity";

const contactApiAdapter = {
  getAll: (filters?: any) => contactPersonApiService.getAll(filters),
  getByCode: (ccode: string) => contactPersonApiService.getByCode(ccode),
  create: (data: any) => contactPersonApiService.createContactPerson(data),
  update: (ccode: string, data: any) => contactPersonApiService.updateContactPerson(ccode, data),
  delete: (ccode: string) => contactPersonApiService.deleteContactPerson(ccode),
};

export function useContactPersons() {
  const baseEntity = useBaseEntity(
    contactApiAdapter as any,
    { page: 1, limit: 10 },
    'contactPersons'
  );

  return {
    ...baseEntity,
    contactPersons: baseEntity.items,
    fetchContactPersons: baseEntity.fetchItems,
    createContactPerson: baseEntity.createItem,
    updateContactPerson: baseEntity.updateItem,
    deleteContactPerson: baseEntity.deleteItem,
    updateContactPersonStatus: baseEntity.updateItemStatus,
    getContactPersonByCode: baseEntity.getItemById,
    updateFilters: baseEntity.updateFilters,
    clearFilters: baseEntity.clearFilters,
    clearError: baseEntity.clearError,
    handleSubmit: baseEntity.handleSubmit,
  };
}