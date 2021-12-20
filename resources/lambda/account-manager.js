const AWS = require('aws-sdk');
const util = require('./util');

function parseToArray(accounts) {
  return accounts.trim().split('\n').sort();
}

exports.getAccountsList = async function(bucketName, accountsFile) {
  let accounts = await util.getObject(bucketName, accountsFile); // retrieve accounts list from S3

  return parseToArray(accounts);
}

exports.updateAccountsList = async function(bucketName, organizationsFile, accountsFile, roleName) {
  let rootAccounts = await util.getObject(bucketName, organizationsFile); // retrieve organizations root accounts from s3
  if(rootAccounts != '') { // if file exists then update accounts file
    let updatedAccountList = '';
    for(let root of rootAccounts.trim().split('\n').sort()) {
      try {
        let credentials = await util.switchRole(root, roleName);
        let organizations = new AWS.Organizations(credentials);
        let accountList = await organizations.listAccounts().promise();
        for(let account of accountList.Accounts) {
          updatedAccountList += `${account.Id}\n`;
        }
      } catch(error) {
        console.error(error.stack);
      }
    }

    await util.putObject(bucketName, accountsFile, updatedAccountList);

    return parseToArray(updatedAccountList);
  }

  return [];
}
