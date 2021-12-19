# Welcome to AWS Sec Monitor
AWS Sec Monitor notifies IAM changes on Users, MFA and Access Keys.

![Solution Blueprint](resources/blueprint.png)

## Use Agreement
Using this software `I Agree` I'm solely responsible for any security issue caused due any misconfiguration and/or bugs.

## Requirements
* [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
* [AWS CDK v2](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install)

## Pre-Deploy
Edit `cdk.context.json` and fulfill the following parameters:
* bucketName (Optional) - Amazon S3 bucket name
* cronExpression (Required) - [Cron expression](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-rule-schedule.html#eb-cron-expressions) used to schedule the monitoring
* roleName (Required) - IAM RoleName assumed to generate the reports
* email (Required) - Email to be notified with changelog report

Sample file:
```
{
  "bucketName": "my-bucket-name",
  "cronExpression": "cron(0 * * * ? *)",
  "roleName": "AWSSecMonitorRole",
  "email": "sec-team@example.com"
}
```

## Deploy
To deploy this app, you need to be in root directory. Then run the following commands:
```
npm run deps
cdk bootstrap
cdk deploy
```

## Post-Deploy
* Create a file named `accounts.txt` in the root of S3 bucket provisioned, containing the accounts id to be monitored separated by line (`Unix LF = \n`); Sample file:
```
111111111111
222222222222
333333333333
```
* Create an IAM role named as the `roleName` parameter, in each account you'd like to monitor. It must contain the following [trust relationship](resources/iam-switch-role-trust.json) and [policy](resources/iam-switch-role-policy.json).

## Report Sample
Report Format:

Account Id | User Name | MFA Enabled | Access Key Id | AK Created Date | AK Last Used Date

```
+ 111111111111	user1	false
- 222222222222	user2	false	AAAAAAAAAAAAAAAAAAAA	2021-12-14T20:57:31.000Z
+ 333333333333	user3	false	BBBBBBBBBBBBBBBBBBBB	2021-12-11T22:04:52.000Z
+ 333333333333	user4	false	CCCCCCCCCCCCCCCCCCCC	2021-12-14T19:45:47.000Z	2021-12-14T19:48:00.000Z
- 333333333333	user5	true	DDDDDDDDDDDDDDDDDDDD	2021-12-12T21:35:39.000Z	2021-12-12T21:48:00.000Z
```

## Testing
You can manually invoke the report by running the following script in the root directory:
```
./invoke.sh
```

## Cleanup
cdk destroy
