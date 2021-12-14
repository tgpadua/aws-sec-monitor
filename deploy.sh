#!/bin/bash

# File containing accounts analyzed
export ACCOUNTS_FILENAME="accounts.txt";

# EventBridge cron expressions used to trigger Lambda
export CRON_EXPRESSION="cron(0 * * * ? *)";

# Role name used by Lambda to invoke STS Assume Role
export ROLE_NAME="AWSSecMonitorRole";

# Amazon S3 Bucket name
export BUCKET_NAME="MY_BUCKET_NAME";

# Email to be notified with report changelog
export EMAIL="sec-group@email.com";

cdk bootstrap
cdk deploy
