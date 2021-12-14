# Welcome to AWS Sec Monitor
AWS Sec Monitor keeps notifying you on IAM changes (User, MFA, Access Keys).

![Solution Blueprint](resources/blueprint.png)

## Install
* First edit `deploy.sh` and update with your environment settings.
* Execute the script `./deploy.sh`

## Configure
* Upload a file (default: `accounts.txt`) containing the accounts id to be monitored in the specified S3 bucket
* Create an IAM role in each account to be monitored with the following [policy](resources/iam-switch-role-policy.json).

## Report Sample
Report Format:

Account Id | User Name | MFA Enabled | Access Key Id | AK Created Date | AK Last Used Date

```
+ 123456789012	user1	false
- 123456789012	user2	false	AKIAYGACINKTNX32JRYS	2021-12-14T20:57:31.000Z
+ 987654321090	user3	false	AKIAREEL4EBJPWG65HBZ	2021-12-11T22:04:52.000Z
+ 987654321090	user4	false	AKIAREEL4EBJDL2JJQX7	2021-12-14T19:45:47.000Z	2021-12-14T19:48:00.000Z
- 987654321090	user5	true	AKIAREEL4EBJJWUP5U7R	2021-12-12T21:35:39.000Z	2021-12-12T21:48:00.000Z
```

## Cleanup
cdk destroy
