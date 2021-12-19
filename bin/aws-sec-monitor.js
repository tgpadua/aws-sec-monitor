#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { AwsSecMonitorStack } = require('../lib/aws-sec-monitor-stack');

const app = new cdk.App();
new AwsSecMonitorStack(app, 'AwsSecMonitorStack', {});
