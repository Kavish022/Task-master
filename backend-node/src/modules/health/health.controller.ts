import { Request, Response } from 'express';
import { prisma } from '../../config/db';
import { ApiResponse } from '../../utils/apiResponse';
import { ResponseMessages } from '../../constants/responseMessages';

export class HealthController {
  static async check(_req: Request, res: Response): Promise<Response> {
    const startTime = Date.now();
    let dbStatus = 'healthy';

    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      dbStatus = `unhealthy: ${(error as Error).message}`;
    }

    const memoryUsage = process.memoryUsage();

    return ApiResponse.send(res, {
      message: ResponseMessages.HEALTH_OK,
      data: {
        status: dbStatus === 'healthy' ? 'UP' : 'DEGRADED',
        database: dbStatus,
        uptimeSeconds: Math.floor(process.uptime()),
        responseTimeMs: Date.now() - startTime,
        environment: process.env.NODE_ENV,
        memory: {
          heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
          heapTotalMb: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
          rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
        },
      },
    });
  }
}
