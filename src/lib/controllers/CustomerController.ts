import { CustomerInsert, CustomerModel, CustomerSelect } from "../models/CustomerModel";
import { ModelController } from "./ModelController";

export class CustomerController extends ModelController<CustomerSelect, CustomerInsert, CustomerModel> {
  constructor() {
    super(new CustomerModel());
  }
}

export const customerController = new CustomerController();