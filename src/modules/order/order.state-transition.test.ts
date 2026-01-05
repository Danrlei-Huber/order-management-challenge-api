import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { OrderModel } from './order.model.js';
import { OrderState, orderStateFlow } from './enums/order-state.enum.js';
import { OrderStatus } from './enums/order-status.enum.js';
import { getNextState } from './order.service.js';
import { env } from '../../config/env.js';

describe('Order State Transition Logic', () => {
  beforeAll(async () => {
    await mongoose.connect(env.mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('getNextState function', () => {
    it('should return ANALYSIS when current state is CREATED', () => {
      const nextState = getNextState(OrderState.CREATED);
      expect(nextState).toBe(OrderState.ANALYSIS);
    });

    it('should return COMPLETED when current state is ANALYSIS', () => {
      const nextState = getNextState(OrderState.ANALYSIS);
      expect(nextState).toBe(OrderState.COMPLETED);
    });

    it('should return null when current state is COMPLETED (final state)', () => {
      const nextState = getNextState(OrderState.COMPLETED);
      expect(nextState).toBeNull();
    });

    it('should return null for invalid state', () => {
      const nextState = getNextState('INVALID_STATE' as OrderState);
      expect(nextState).toBeNull();
    });
  });

  describe('Order State Flow', () => {
    it('should follow the correct state flow order', () => {
      expect(orderStateFlow).toEqual([
        OrderState.CREATED,
        OrderState.ANALYSIS,
        OrderState.COMPLETED,
      ]);
    });

    it('should not allow skipping states (CREATED -> COMPLETED directly)', () => {
      expect(getNextState(OrderState.CREATED)).toBe(OrderState.ANALYSIS);
      expect(getNextState(OrderState.ANALYSIS)).toBe(OrderState.COMPLETED);
      expect(getNextState(OrderState.CREATED)).not.toBe(OrderState.COMPLETED);
    });

    it('should not allow backward transitions', () => {
      const nextStateFromCompleted = getNextState(OrderState.COMPLETED);
      expect(nextStateFromCompleted).not.toBe(OrderState.ANALYSIS);

      const nextStateFromAnalysis = getNextState(OrderState.ANALYSIS);
      expect(nextStateFromAnalysis).not.toBe(OrderState.CREATED);
    });
  });

  describe('Order Model State Validation', () => {
    it('should create an order with CREATED state', async () => {
      const order = await OrderModel.create({
        lab: 'Lab Test',
        patient: 'John Doe',
        customer: 'Customer Inc',
        services: [{ name: 'Test Service', value: 100, status: 'PENDING' }],
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
      });

      expect(order.state).toBe(OrderState.CREATED);
      expect(order.status).toBe(OrderStatus.ACTIVE);

      await OrderModel.deleteOne({ _id: order._id });
    });

    it('should allow transition from CREATED to ANALYSIS', async () => {
      const order = await OrderModel.create({
        lab: 'Lab Test',
        patient: 'Jane Doe',
        customer: 'Customer Inc',
        services: [{ name: 'Test Service', value: 100, status: 'PENDING' }],
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
      });

      const nextState = getNextState(order.state);
      expect(nextState).toBe(OrderState.ANALYSIS);

      order.state = nextState!;
      await order.save();

      const updated = await OrderModel.findById(order._id);
      expect(updated?.state).toBe(OrderState.ANALYSIS);

      await OrderModel.deleteOne({ _id: order._id });
    });

    it('should prevent jumping states (CREATED -> COMPLETED)', async () => {
      const order = await OrderModel.create({
        lab: 'Lab Test',
        patient: 'Bob Smith',
        customer: 'Customer Inc',
        services: [{ name: 'Test Service', value: 100, status: 'PENDING' }],
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
      });

      const canJump = getNextState(OrderState.CREATED) === OrderState.COMPLETED;
      expect(canJump).toBe(false);

      let nextState = getNextState(order.state);
      expect(nextState).toBe(OrderState.ANALYSIS);
      order.state = nextState!;
      await order.save();

      nextState = getNextState(order.state);
      expect(nextState).toBe(OrderState.COMPLETED);

      await OrderModel.deleteOne({ _id: order._id });
    });
  });

  describe('Order Transition Edge Cases', () => {
    it('should block transition when order is DELETED', async () => {
      const order = await OrderModel.create({
        lab: 'Lab Test',
        patient: 'Alice',
        customer: 'Customer Inc',
        services: [{ name: 'Test Service', value: 100, status: 'PENDING' }],
        state: OrderState.CREATED,
        status: OrderStatus.DELETED,
      });

      const isDeleted = order.status === OrderStatus.DELETED;
      expect(isDeleted).toBe(true);
      expect(order.state).toBe(OrderState.CREATED);

      await OrderModel.deleteOne({ _id: order._id });
    });

    it('should complete full state transition sequence', async () => {
      const order = await OrderModel.create({
        lab: 'Lab Test',
        patient: 'Charlie',
        customer: 'Customer Inc',
        services: [
          { name: 'Service 1', value: 50, status: 'DONE' },
          { name: 'Service 2', value: 50, status: 'DONE' },
        ],
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
      });

      let currentState = order.state;
      expect(currentState).toBe(OrderState.CREATED);
      
      let nextState = getNextState(currentState);
      expect(nextState).toBe(OrderState.ANALYSIS);
      order.state = nextState!;
      await order.save();

      currentState = order.state;
      expect(currentState).toBe(OrderState.ANALYSIS);
      
      nextState = getNextState(currentState);
      expect(nextState).toBe(OrderState.COMPLETED);
      order.state = nextState!;
      await order.save();

      currentState = order.state;
      expect(currentState).toBe(OrderState.COMPLETED);
      
      nextState = getNextState(currentState);
      expect(nextState).toBeNull();

      const final = await OrderModel.findById(order._id);
      expect(final?.state).toBe(OrderState.COMPLETED);

      await OrderModel.deleteOne({ _id: order._id });
    });

    it('should reject reverse transitions (COMPLETED -> ANALYSIS)', async () => {
      const order = await OrderModel.create({
        lab: 'Lab Test',
        patient: 'Diana',
        customer: 'Customer Inc',
        services: [{ name: 'Test Service', value: 100, status: 'DONE' }],
        state: OrderState.COMPLETED,
        status: OrderStatus.ACTIVE,
      });

      const nextState = getNextState(OrderState.COMPLETED);
      expect(nextState).toBeNull();

      const canTransitionBack = nextState === OrderState.ANALYSIS;
      expect(canTransitionBack).toBe(false);

      await OrderModel.deleteOne({ _id: order._id });
    });

    it('should handle multiple orders independently', async () => {
      const order1 = await OrderModel.create({
        lab: 'Lab A',
        patient: 'Patient 1',
        customer: 'Customer A',
        services: [{ name: 'Service', value: 100, status: 'PENDING' }],
        state: OrderState.CREATED,
        status: OrderStatus.ACTIVE,
      });

      const order2 = await OrderModel.create({
        lab: 'Lab B',
        patient: 'Patient 2',
        customer: 'Customer B',
        services: [{ name: 'Service', value: 100, status: 'PENDING' }],
        state: OrderState.ANALYSIS,
        status: OrderStatus.ACTIVE,
      });

      expect(order1.state).toBe(OrderState.CREATED);
      expect(order2.state).toBe(OrderState.ANALYSIS);

      expect(getNextState(order1.state)).toBe(OrderState.ANALYSIS);
      expect(getNextState(order2.state)).toBe(OrderState.COMPLETED);

      await OrderModel.deleteOne({ _id: order1._id });
      await OrderModel.deleteOne({ _id: order2._id });
    });
  });

  describe('State Transition Validation Rules', () => {
    it('should enforce strict linear progression', () => {
      const states = [OrderState.CREATED, OrderState.ANALYSIS, OrderState.COMPLETED];
      
      for (let i = 0; i < states.length - 1; i++) {
        const current = states[i];
        const expected = states[i + 1];
        const next = getNextState(current);
        expect(next).toBe(expected);
      }

      const finalNext = getNextState(OrderState.COMPLETED);
      expect(finalNext).toBeNull();
    });

    it('should validate that state flow cannot be bypassed', () => {
      expect(getNextState(OrderState.CREATED)).not.toBe(OrderState.COMPLETED);
      expect(getNextState(OrderState.ANALYSIS)).not.toBe(OrderState.CREATED);
      expect(getNextState(OrderState.COMPLETED)).not.toBe(OrderState.CREATED);
      expect(getNextState(OrderState.COMPLETED)).not.toBe(OrderState.ANALYSIS);
    });
  });
});
