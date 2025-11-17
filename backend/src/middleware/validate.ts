// backend/src/middleware/validate.ts

import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

/**
 * Flexible validation middleware that can validate body, query, and params
 * Accepts a schema with optional body, query, and params properties
 *
 * This is functionally identical to validateRequest from validator.ts
 * but exported with a different name for consistency with existing imports
 */
export const validate = (schema: z.ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse the entire request object (body, query, params)
      const validatedData: any = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Update request with validated data
      if (validatedData.body) {
        req.body = validatedData.body;
      }
      if (validatedData.query) {
        req.query = validatedData.query as any;
      }
      if (validatedData.params) {
        req.params = validatedData.params as any;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors
          .map((err: any) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        next(new ValidationError(message));
      } else {
        next(error);
      }
    }
  };
};
