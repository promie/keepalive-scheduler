import { Handler } from 'aws-lambda';
import { initConfig } from './config';
import type { KeepaliveEvent, KeepaliveResponse } from './supabaseKeepAlive.cron.types';

const { API_URL } = initConfig();

export const handler: Handler<KeepaliveEvent, KeepaliveResponse> = async (event, context) => {
  console.log('Keepalive scheduler triggered', {
    requestId: context.awsRequestId,
    eventTime: event.time,
  });

  if (!API_URL) {
    console.error('API_URL environment variable is not set');
    throw new Error('API_URL environment variable is required');
  }

  try {
    console.log(`Making GET request to: ${API_URL}`);

    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'AWS-Lambda-Keepalive-Scheduler',
      },
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      console.warn(`Non-OK response received: ${response.status} ${response.statusText}`);
    }

    const responseBody = await response.text();
    console.log(`Response body length: ${responseBody.length} characters`);

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
    console.error('Error making keepalive request:', error);

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
