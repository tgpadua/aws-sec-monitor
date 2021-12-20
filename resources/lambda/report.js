var AWS = require('aws-sdk');
var sts = new AWS.STS();

class Report {
  /**
   * Generates a report
   *
   * @param {string} account Account Id number.
   * @param {string} roleName IAM Role name used during switch role.
   * @return {string} account report
   */
  async generate(account, roleName) {
    try {
      let credentials = await this.switchRole(account, roleName);
      let report = await this.query(account, credentials);
      let textReport = this.toText(report);

      return textReport;
    } catch (error) {
      console.log(error.stack);
    }
  }

  /**
   * Obtains a temporary credentials to access different accounts
   *
   * @param {string} account Account Id number.
   * @param {string} roleName IAM Role name used during switch role.
   * @return {Object} IAM credential element
   */
  async switchRole(account, roleName) {
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

  /**
   * Retrieves account report
   *
   * @param {string} account Account Id number.
   * @param {Object} credential element
   * @return {Object} account report
   */
  async query(account, credentials) {
    throw new Error('Not implemented.');
  }

  /**
   * Retrieves account report
   *
   * @param {Object} report
   * @return {string} report
   */
  toText(report) {
    throw new Error('Not implemented.');
  }

  /**
   * Retrieves account report
   *
   * @param {string} report1 previous report
   * @param {string} report2 new report
   * @return {string} changelog report
   */
  changelog(report1, report2) {
    throw new Error('Not implemented.');
  }
}

module.exports = Report;
