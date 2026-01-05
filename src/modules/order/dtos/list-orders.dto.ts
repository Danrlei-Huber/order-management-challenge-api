import type { OrderState } from "../enums/order-state.enum.js";

export interface ListOrdersQueryDTO {
  page?: number;
  limit?: number;
  state?: OrderState;
}
