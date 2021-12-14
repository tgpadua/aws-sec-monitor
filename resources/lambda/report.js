var AWS = require('aws-sdk');
var sts = new AWS.STS();

const DELIMITER = '\t';
const MAX_ITEMS = 500;

/**
* Report Format: Account Id | User Name | MFA Enabled | Access Key Id | AK Created Date | AK Last Used Date
*/
exports.generate = async function(account, roleName) {
  let credentials = await switchRole(account, roleName);
  let report = await query(account, credentials);

  return report;
};

async function query(account, credentials) {
  let iam = new AWS.IAM(credentials);
  let users = await iam.listUsers({ MaxItems: MAX_ITEMS }).promise();

  let report = '';
  for(let user of users.Users) {
    let mfaList = await iam.listMFADevices({ MaxItems: MAX_ITEMS, UserName: user.UserName }).promise();
    let mfaEnabled = mfaList.MFADevices.length > 0;

    let userInfo = `${account}${DELIMITER}${user.UserName}${DELIMITER}${mfaEnabled}`;
    let reportLine = userInfo;

    let accessKeyList = await iam.listAccessKeys({ MaxItems: MAX_ITEMS, UserName: user.UserName }).promise();
    for(let accessKey of accessKeyList.AccessKeyMetadata) {
      if(accessKey.Status == 'Active') {
        let createDate = accessKey.CreateDate.toISOString();
        reportLine = `${userInfo}${DELIMITER}${accessKey.AccessKeyId}${DELIMITER}${createDate}`;

        let accessKeyLastUsed = await iam.getAccessKeyLastUsed({AccessKeyId:accessKey.AccessKeyId}).promise();
        let lastUsedDate = (accessKeyLastUsed.AccessKeyLastUsed.LastUsedDate);
        if(lastUsedDate) {
          reportLine += `${DELIMITER}${lastUsedDate.toISOString()}`;
        }
      }
      report += `${reportLine}\n`;
    }

    if(accessKeyList.AccessKeyMetadata.length == 0) {
      report += `${reportLine}\n`;
    }
  }

  return report;
}


async function switchRole(account, roleName) {
  const sessionName = `AWS-SEC-MONITOR-${account}`;

  let assumeRoleParams = {
    RoleArn: `arn:aws:iam::${account}:role/${roleName}`,
    RoleSessionName: sessionName
  };
  let assumedRole = await sts.assumeRole(assumeRoleParams).promise();
  let assumedRoleCredentials = assumedRole.Credentials;
  let credentials = {
    accessKeyId: assumedRoleCredentials.AccessKeyId,
    secretAccessKey: assumedRoleCredentials.SecretAccessKey,
    sessionToken: assumedRoleCredentials.SessionToken
  };

  return credentials;
}
