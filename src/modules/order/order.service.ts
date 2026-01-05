import { type Request, type Response } from 'express';

import type { CreateOrderDto } from './dtos/create-order.dto.js';
import { OrderModel } from './order.model.js';
import { OrderState, orderStateFlow } from './enums/order-state.enum.js';
import { OrderStatus } from './enums/order-status.enum.js';
import type { ListOrdersQueryDTO } from './dtos/list-orders.dto.js';


export async function createOrder(req: Request, res: Response) {
   try {
        const body: CreateOrderDto = req.body;
  
        if (!body.services || body.services.length === 0) {
          return res.status(400).json({
            message: 'Order must contain at least one service',
          });
        }
  
        const totalValue = body.services.reduce(
          (sum, service) => sum + service.value,
          0
        );
  
        if (totalValue <= 0) {
          return res.status(400).json({
            message: 'Total order value must be greater than zero',
          });
        }
  
        const order = await OrderModel.create({
          lab: body.lab,
          patient: body.patient,
          customer: body.customer,
          services: body.services,
          state: OrderState.CREATED,
          status: OrderStatus.ACTIVE,
        });
  
        return res.status(201).json(order);
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
        });
    }
}

export async function listOrders(req: Request, res: Response) {
    try {
        const {
        page = 1,
        limit = 10,
        state,
        } = req.query as unknown as ListOrdersQueryDTO;

        const query: any = {
        status: OrderStatus.ACTIVE,
        };

        if (state) {
        query.state = state;
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [orders, total] = await Promise.all([
        OrderModel.find(query)
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 }),
        OrderModel.countDocuments(query),
        ]);

        return res.json({
        data: orders,
        meta: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
        },
        });
    } catch (error) {
      return res.status(500).json({
        message: 'Internal server error',
      });
    }
}


export async function advanceOrderState(req: Request, res: Response) {
  const { id } = req.params;

  const order = await OrderModel.findById(id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.status === "DELETED") {
    return res
      .status(400)
      .json({ message: "Cannot advance a deleted order" });
  }

  const nextState = getNextState(order.state);

  if (!nextState) {
    return res.status(400).json({
      message: `Order already in final state (${order.state})`,
    });
  }

  // regra extra comum: só completa se todos os serviços estiverem DONE
  if (
    nextState === OrderState.COMPLETED &&
    order.services.some((s) => s.status !== "DONE")
  ) {
    return res.status(400).json({
      message: "All services must be DONE to complete the order",
    });
  }

  order.state = nextState;
  await order.save();

  return res.json({
    id: order._id.toString(),
    previousState: order.state === OrderState.ANALYSIS
      ? OrderState.CREATED
      : OrderState.ANALYSIS,
    currentState: order.state,
  });
};


export function getNextState(current: OrderState): OrderState | null {
  const index = orderStateFlow.indexOf(current);

  if (index === -1) {
    return null;
  }

  const next = orderStateFlow[index + 1];

  if (!next) {
    return null;
  }

  return next;
}
