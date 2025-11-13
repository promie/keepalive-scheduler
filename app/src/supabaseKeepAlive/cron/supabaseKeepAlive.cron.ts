import { Handler } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { initConfig } from './config';
import type { KeepaliveEvent, KeepaliveResponse } from './supabaseKeepAlive.cron.types';

const logger = new Logger({ serviceName: 'supabase-keepalive' });
const { API_URL } = initConfig();

export const handler: Handler<KeepaliveEvent, KeepaliveResponse> = async (event, context) => {
  logger.info('Keepalive scheduler triggered', {
    requestId: context.awsRequestId,
    eventTime: event.time,
  });

  if (!API_URL) {
    logger.error('API_URL environment variable is not set');
    throw new Error('API_URL environment variable is required');
  }

  try {
    logger.info(`Making GET request to: ${API_URL}`);

    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'AWS-Lambda-Keepalive-Scheduler',
      },
    });

    logger.info('Response received', { status: response.status });

    if (!response.ok) {
      logger.warn('Non-OK response received', {
        status: response.status,
        statusText: response.statusText,
      });
    }

    const responseBody = await response.text();
    logger.info('Response body received', { bodyLength: responseBody.length });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Keepalive request completed successfully',
        targetUrl: API_URL,
        responseStatus: response.status,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    logger.error('Error making keepalive request', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Keepalive request failed',
        targetUrl: API_URL,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
