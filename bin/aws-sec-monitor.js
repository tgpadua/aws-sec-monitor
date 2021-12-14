#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { AwsSecMonitorStack } = require('../lib/aws-sec-monitor-stack');

const ROLE_NAME = process.env.ROLE_NAME;
const BUCKET_NAME = process.env.BUCKET_NAME;
const ACCOUNTS_FILENAME = process.env.ACCOUNTS_FILENAME;
const CRON_EXPRESSION = process.env.CRON_EXPRESSION;
const EMAIL = process.env.EMAIL;

const app = new cdk.App();
new AwsSecMonitorStack(app, 'AwsSecMonitorStack', {
  roleName: ROLE_NAME,
  bucketName: BUCKET_NAME,
  accountsFilename: ACCOUNTS_FILENAME,
  cronExpression: CRON_EXPRESSION,
  email: EMAIL
});
