import { Duration } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';
import { resolve } from 'path';
import { StandardLambda } from '../../../../common/StandardLambda';
import { APP_ROOT } from '../../../../common/utils';

interface SupabaseKeepAliveCronProps {
    appName: string;
}

export class SupabaseKeepAliveCron extends Construct {
    public readonly lambda: StandardLambda;
    public readonly scheduleRule: Rule;

    constructor(scope: Construct, id: string, props: SupabaseKeepAliveCronProps) {
        super(scope, id);

        const { appName } = props;
        const intervalDays = 5;

        this.lambda = new StandardLambda(this, 'SupabaseKeepAlive', {
            appName,
            entry: resolve(APP_ROOT, 'src/supabaseKeepAlive/cron/supabaseKeepAlive.cron.ts'),
            environment: {},
            description: 'Supabase keepalive cron',
        });

        this.scheduleRule = new Rule(this, 'SupabaseKeepAliveSchedule', {
            ruleName: `${appName}-supabase-keepalive-schedule`,
            schedule: Schedule.rate(Duration.days(intervalDays)),
            description: `Trigger Supabase keepalive Lambda every ${intervalDays} days`,
            enabled: true,
        });

        this.scheduleRule.addTarget(
            new LambdaFunction(this.lambda, {
                retryAttempts: 2,
                maxEventAge: Duration.hours(2),
            })
        );
    }
}
