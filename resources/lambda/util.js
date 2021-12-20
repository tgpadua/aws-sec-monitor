const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const sns = new AWS.SNS();
const sts = new AWS.STS();


const { diffLinesRaw } = require('jest-diff');

exports.diff = function(content1, content2) {
  let result = '';
  let diff = diffLinesRaw(content1, content2);

  for(let line of diff) {
    if(line[0] == 1) {
      result += `+ ${line[1]}\n`;
    } else if (line[0] == -1) {
      result += `- ${line[1]}\n`;
    }
  }

  return result;
}

/**
 * Obtains a temporary credentials to access different accounts
 *
 * @param {string} account Account Id number.
 * @param {string} roleName IAM Role name used during switch role.
 * @return {Object} IAM credential element
 */
exports.switchRole = async function(account, roleName) {
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

exports.publishNotification = async function(topicArn, subject, message) {
  await sns.publish({
    TopicArn: topicArn,
    Subject: subject,
    Message: message
  }).promise();
}

exports.copyObject = async function(bucket, srcKey, dstKey) {
  await s3.copyObject({
    Bucket: bucket,
    CopySource: `${bucket}/${srcKey}`,
    Key: dstKey})
    .promise();
}

exports.putObject = async function(bucket, key, data) {
  await s3.putObject({Bucket: bucket, Key: key, Body: data}).promise();
}

exports.getObject = async function(bucket, key) {
  try {
    let object = await s3.getObject({Bucket: bucket, Key: key}).promise();
    return object.Body.toString();
  } catch (err) {
    console.log(err);
    return '';
  }
}
