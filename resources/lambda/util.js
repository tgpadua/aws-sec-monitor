const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const sns = new AWS.SNS();

const { diffLinesRaw } = require('jest-diff');

exports.publishNotification = async function(topicArn, subject, message) {
  await sns.publish({
    TopicArn: topicArn,
    Subject: subject,
    Message: message
  }).promise();
}

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
