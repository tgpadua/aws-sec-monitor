const util = require('./util');
const IAMReport = require('./iam-report');
const accountManager = require('./account-manager');

const LATEST_KEY = 'report-latest.tsv';
const ROLE_NAME = process.env.ROLE_NAME;
const BUCKET_NAME = process.env.BUCKET_NAME;
const ACCOUNTS_FILENAME = process.env.ACCOUNTS_FILENAME;
const ORGANIZATIONS_FILENAME = process.env.ORGANIZATIONS_FILENAME;
const TOPIC_ARN = process.env.TOPIC_ARN;

var iamReport = new IAMReport();

exports.handler = async (event) => {
  try {
    let previousReport = await util.getObject(BUCKET_NAME, LATEST_KEY); // retrieve previousReport from S3

    let accounts = await accountManager.updateAccountsList(BUCKET_NAME, ORGANIZATIONS_FILENAME, ACCOUNTS_FILENAME, ROLE_NAME);
    if(accounts.length == 0) {
      accounts = await accountManager.getAccountsList(BUCKET_NAME, ACCOUNTS_FILENAME);
    }

    let newReport = '';
    let reportPromisses = new Array();
    for(let account of accounts) {
      reportPromisses.push(iamReport.generate(account, ROLE_NAME));
    }

    let reports = await Promise.all(reportPromisses);
    for(let report of reports) {
      if(report != undefined) { // ignore reports which raised exceptions
        newReport += report;
      }
    }

    let today = new Date();
    let date = `${today.getFullYear()}/${today.getMonth()+1}/${today.getDate()}`;
    let suffix = Date.now();
    let newReportKey = `archive/${date}/report-${suffix}.tsv`;

    await util.putObject(BUCKET_NAME, newReportKey, newReport);
    await util.copyObject(BUCKET_NAME, newReportKey, LATEST_KEY);

    let changelog = iamReport.changelog(previousReport, newReport);
    if (changelog != '') {
      let changelogKey = `changelog/changelog-${suffix}.txt`;
      await util.putObject(BUCKET_NAME, changelogKey, changelog);
      let message = `IAM Changes Identified\n\n${changelog}`;
      await util.publishNotification(TOPIC_ARN, 'AWSSecMonitor Notification', message);
    }

    return { body: newReport +'---\n'+ changelog };
  } catch (error) {
    console.error(error.stack);
    return { body: error.stack };
  }
};
