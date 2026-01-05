export interface CreateOrderServiceDto {
  name: string;
  value: number;
}

export interface CreateOrderDto {
  lab: string;
  patient: string;
  customer: string;
  services: CreateOrderServiceDto[];
}
