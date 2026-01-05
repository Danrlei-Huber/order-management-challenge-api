export enum OrderState {
  CREATED = 'CREATED',
  ANALYSIS = 'ANALYSIS',
  COMPLETED = 'COMPLETED',
}

export const orderStateFlow: OrderState[] = [
  OrderState.CREATED,
  OrderState.ANALYSIS,
  OrderState.COMPLETED,
];