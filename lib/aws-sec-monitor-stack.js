const { Stack, Duration } = require('aws-cdk-lib');
const { AWSSecMonitorConstruct } = require('./aws-sec-monitor-construct');

class AwsSecMonitorStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    new AWSSecMonitorConstruct(this, 'AWSSecMonitor', {
      bucketName: this.node.tryGetContext('bucketName'),
      roleName: this.node.tryGetContext('roleName'),
      cronExpression: this.node.tryGetContext('cronExpression'),
      email: this.node.tryGetContext('email')
    });
  }
}

module.exports = { AwsSecMonitorStack }
