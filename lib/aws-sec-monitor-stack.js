const { Stack, Duration } = require('aws-cdk-lib');
const { AWSSecMonitorConstruct } = require('./aws-sec-monitor-construct');

// const sqs = require('aws-cdk-lib/aws-sqs');

class AwsSecMonitorStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    new AWSSecMonitorConstruct(this, 'AWSSecMonitor', props);
  }
}

module.exports = { AwsSecMonitorStack }
