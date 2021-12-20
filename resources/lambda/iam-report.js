const AWS = require('aws-sdk');
const Report = require('./report');
const util = require('./util');

const DELIMITER = '\t';
const MAX_ITEMS = 500;

class IAMReport extends Report {
  /**
   * Retrieves account report
   *
   * @param {string} account Account Id number.
   * @param {Object} credential element
   * @return {Object} account report
   */
  async query(account, credentials) {
    let iam = new AWS.IAM(credentials);
    let users = await iam.listUsers({ MaxItems: MAX_ITEMS }).promise();

    let report = new Array();
    for(let user of users.Users) {
      let mfaList = await iam.listMFADevices({ MaxItems: MAX_ITEMS, UserName: user.UserName }).promise();
      let mfaEnabled = mfaList.MFADevices.length > 0;

      let reportItem = {
        account: account,
        username: user.UserName,
        mfa: mfaEnabled,
        accessKeys: new Array()
      };

      let accessKeyList = await iam.listAccessKeys({ MaxItems: MAX_ITEMS, UserName: user.UserName }).promise();
      for(let accessKey of accessKeyList.AccessKeyMetadata) {
        if(accessKey.Status == 'Active') {
          let accessKeyItem = {
            id: accessKey.AccessKeyId,
            createDate: accessKey.CreateDate.toISOString()
          }

          let accessKeyLastUsed = await iam.getAccessKeyLastUsed({AccessKeyId:accessKey.AccessKeyId}).promise();
          let lastUsedDate = (accessKeyLastUsed.AccessKeyLastUsed.LastUsedDate);
          if(lastUsedDate) {
            accessKeyItem.lastUsedDate = lastUsedDate.toISOString();
          }

          reportItem.accessKeys.push(accessKeyItem);
        }
      }

      report.push(reportItem);
    }

    return report;
  }

  /**
   * Retrieves account report
   *
   * @param {Object} report
   * @return {string} report
   */
  toText(report) {
    let textReport = '';
    for(let item of report) {
      let userInfo = `${item.account}${DELIMITER}${item.username}${DELIMITER}${item.mfa}`;
      let reportLine = userInfo;

      for(let accessKey of item.accessKeys) {
        reportLine = `${userInfo}${DELIMITER}${accessKey.id}${DELIMITER}${accessKey.createDate}`;
        if(accessKey.lastUsedDate) {
          reportLine += `${DELIMITER}${accessKey.lastUsedDate}`;
        }
        textReport += `${reportLine}\n`;
      }

      if(item.accessKeys.length == 0) {
        textReport += `${reportLine}\n`;
      }
    }

    return textReport;
  }

  /**
   * Retrieves account report
   *
   * @param {string} report1 previous report
   * @param {string} report2 new report
   * @return {string} changelog report
   */
  changelog(report1, report2) {
    let r1 = this.trimLastUsedDate(report1);
    let r2 = this.trimLastUsedDate(report2);

    return util.diff(r1, r2);
  }

  trimLastUsedDate(report) {
    let result = new Array();
    for(let line of report.split('\n').sort()) {
      if(line.split('\t').length < 6) { // if there is no AK lastUsedDate just the line
        result.push(line);
      } else {  // otherwise drops AK lastUsedDate
        result.push(line.substring(0,line.length-25));
      }
    }

    return result;
  }

}

module.exports = IAMReport;
