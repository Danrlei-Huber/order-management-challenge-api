import { ServiceStatus } from "./enums/service-status.enum.js";
import { OrderState } from "./enums/order-state.enum.js";
import { OrderStatus } from "./enums/order-status.enum.js";

export class OrderService {
  name: string;
  value: number;
  status: ServiceStatus;

  constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
    this.status = ServiceStatus.PENDING;
  }
}

export class Order {
  id?: string;
  lab: string;
  patient: string;
  customer: string;
  state: OrderState;
  status: OrderStatus;
  services: OrderService[];

  constructor(
    lab: string,
    patient: string,
    customer: string,
    services: OrderService[]
  ) {
    this.lab = lab;
    this.patient = patient;
    this.customer = customer;
    this.services = services;
    this.state = OrderState.CREATED;
    this.status = OrderStatus.ACTIVE;
  }
}
