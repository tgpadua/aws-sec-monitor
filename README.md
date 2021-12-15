# Welcome to AWS Sec Monitor
AWS Sec Monitor notifies IAM changes on Users, MFA and Access Keys.

![Solution Blueprint](resources/blueprint.png)

## Use Agreement
Using this software `I Agree` I'm solely responsible for any security issue caused due any misconfiguration and/or bugs.

## Requirements
* [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
* [AWS CDK v2](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install)

## Install
* Run `npm install` in the project root folder
* Access the lambda project `cd resources/lambda` and run `npm install`
* Edit `deploy.sh` and update with your environment settings
* Execute the script `./deploy.sh`

## Configure
* Upload a file (default: `accounts.txt`) containing the accounts id to be monitored in the specified S3 bucket
* Create an IAM role in each account to be monitored using the following [trust relationship](resources/iam-switch-role-trust.json) and [policy](resources/iam-switch-role-policy.json).

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

## Cleanup
cdk destroy
