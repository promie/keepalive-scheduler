import { Duration } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { resolve } from 'path';
import { StandardLambda } from '../../../../common/StandardLambda';
import { APP_ROOT } from '../../../../common/utils';
import type { Config } from '../../../../../app/src/supabaseKeepAlive/cron/config';

interface SupabaseKeepAliveCronProps {
    appName: string;
}

export class SupabaseKeepAliveCron extends Construct {
    constructor(scope: Construct, id: string, props: SupabaseKeepAliveCronProps) {
        super(scope, id);

        const { appName } = props;

        const lambda = new StandardLambda(this, 'SupabaseKeepAlive', {
            entry: resolve(APP_ROOT, 'src/supabaseKeepAlive/cron/supabaseKeepAlive.cron.ts'),
            appName,
            timeout: Duration.minutes(1),
            runtime: Runtime.NODEJS_22_X,
            environment: {
                API_URL: '',
            } satisfies Config,
        });

        const scheduleRule = new Rule(this, 'SupabaseKeepAliveSchedule', {
            ruleName: `${appName}-supabase-keepalive-schedule`,
            schedule: Schedule.rate(Duration.days(5)),
            enabled: true,
        });

        scheduleRule.addTarget(
            new LambdaFunction(lambda, {
                retryAttempts: 2,
                maxEventAge: Duration.hours(2),
            })
        );
    }
}
