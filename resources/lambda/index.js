
var util = require('./util');
var report = require('./report');
const LATEST_KEY = 'report-latest.tsv';
const ROLE_NAME = process.env.ROLE_NAME;
const BUCKET_NAME = process.env.BUCKET_NAME;
const ACCOUNTS_FILENAME = process.env.ACCOUNTS_FILENAME;
const TOPIC_ARN = process.env.TOPIC_ARN;

exports.handler = async (event) => {
  try {
    let latestReport = await util.getObject(BUCKET_NAME, LATEST_KEY);
    let accounts = await util.getObject(BUCKET_NAME, ACCOUNTS_FILENAME);

    let newReport = '';
    for(let account of accounts.trim().split('\n')) {
      newReport += await report.generate(account, ROLE_NAME);
    }

    let suffix = Date.now();
    let newReportKey = `archive/report-${suffix}.tsv`;
    await util.putObject(BUCKET_NAME, newReportKey, newReport);
    await util.copyObject(BUCKET_NAME, newReportKey, LATEST_KEY);

    let changelog = util.diff(latestReport, newReport);
    if (changelog != '') {
      let changelogKey = `changelog/changelog-${suffix}.txt`;
      await util.putObject(BUCKET_NAME, changelogKey, changelog);
      let message = `IAM Changes Identified\n\n${changelog}`;
      await util.publishNotification(TOPIC_ARN, 'AWSSecMonitor Notification', message);
    }

    return { body: newReport +'---\n'+ changelog };
  } catch (error) {
    console.log(error.stack);
    return { body: error.stack };
  }
};
