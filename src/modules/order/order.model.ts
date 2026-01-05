import { Schema, model, Document } from 'mongoose';
import { OrderStatus } from './enums/order-status.enum.js';
import { OrderState } from './enums/order-state.enum.js';
import { ServiceStatus } from './enums/service-status.enum.js';


export interface OrderService {
  name: string;
  value: number;
  status: ServiceStatus;
}

export interface OrderDocument extends Document {
  lab: string;
  patient: string;
  customer: string;
  state: OrderState;
  status: OrderStatus;
  services: OrderService[];
}

const ServiceSchema = new Schema<OrderService>(
  {
    name: { type: String, required: true },
    value: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(ServiceStatus),
      required: true,
    },
  },
  { _id: false }
);

const OrderSchema = new Schema<OrderDocument>(
  {
    lab: { type: String, required: true },
    patient: { type: String, required: true },
    customer: { type: String, required: true },

    state: {
      type: String,
      enum: Object.values(OrderState),
      default: OrderState.CREATED,
    },

    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.ACTIVE,
    },

    services: {
      type: [ServiceSchema],
      required: true,
      validate: {
        validator: (services: OrderService[]) => services.length > 0,
        message: 'Order must contain at least one service',
      },
    },
  },
  { timestamps: true }
);

export const OrderModel = model<OrderDocument>('Order', OrderSchema);
