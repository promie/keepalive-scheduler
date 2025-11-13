#!/usr/bin/env node
import 'source-map-support/register';
import { App, StackProps } from 'aws-cdk-lib';
import { KeepAliveStack } from './stacks/keepAlive/stack';

const {
    CDK_DEPLOY_ACCOUNT = process.env.CDK_DEFAULT_ACCOUNT,
    CDK_DEPLOY_REGION = process.env.CDK_DEFAULT_REGION,
    APP_NAME = 'KeepaliveScheduler',
    STAGE = process.env.NODE_ENV || 'staging',
} = process.env;

const baseProps: StackProps = {
    env: {
        account: CDK_DEPLOY_ACCOUNT,
        region: CDK_DEPLOY_REGION,
    },
};

const app = new App();

new KeepAliveStack(app, `${APP_NAME}Stack`, {
    ...baseProps,
    stackName: `${APP_NAME}-${STAGE}`,
    appName: APP_NAME,
    stage: STAGE,
});
