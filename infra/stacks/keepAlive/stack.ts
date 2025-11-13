import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { SupabaseKeepAliveCron } from './constructs/cron/supabaseKeepAlive.construct';

interface KeepAliveStackProps extends StackProps {
    appName: string;
    stage: string;
}

export class KeepAliveStack extends Stack {
    constructor(scope: Construct, id: string, props: KeepAliveStackProps) {
        super(scope, id, props);

        const { appName } = props;

        new SupabaseKeepAliveCron(this, 'SupabaseKeepAliveCron', {
            appName,
        });
    }
}
