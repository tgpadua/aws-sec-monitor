const cdk = require('aws-cdk-lib');
const s3 = require('aws-cdk-lib/aws-s3');
const lambda = require('aws-cdk-lib/aws-lambda');
const iam = require('aws-cdk-lib/aws-iam');
const apigateway = require("aws-cdk-lib/aws-apigateway");
const targets = require('aws-cdk-lib/aws-events-targets');
const sns = require('aws-cdk-lib/aws-sns');
const subscriptions = require('aws-cdk-lib/aws-sns-subscriptions');

const { Construct } = require('constructs');
const { Duration } = require('aws-cdk-lib');
const { Rule, Schedule } = require('aws-cdk-lib/aws-events');

const ACCOUNTS_FILENAME = 'accounts.txt';
const RESOURCE_NAME = 'AWSSecMonitor';

class AWSSecMonitorConstruct extends Construct {
  constructor(scope, id, props = {}) {
    super(scope, id);

    let bucketProperties = { blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL };
    if(props.bucketName) bucketProperties.bucketName = props.bucketName;
    const bucket = new s3.Bucket(this, 'S3Bucket', bucketProperties);

    const topic = new sns.Topic(this, 'Topic', {
      displayName: RESOURCE_NAME,
      topicName: RESOURCE_NAME
    });
    topic.addSubscription(new subscriptions.EmailSubscription(props.email));

    const lambdaFunction = new lambda.Function(this, 'LambdaFunction', {
      functionName: RESOURCE_NAME,
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('resources/lambda'),
      handler: 'index.handler',
      architecture: lambda.Architecture.ARM_64,
      memorySize: 256,
      timeout: Duration.seconds(60*15),
      environment: {
        ROLE_NAME: props.roleName,
        BUCKET_NAME: bucket.bucketName,
        TOPIC_ARN: topic.topicArn,
        ACCOUNTS_FILENAME: ACCOUNTS_FILENAME,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1'
      }
    });
    lambdaFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['sts:AssumeRole'],
      resources: [ `arn:aws:iam::*:role/${props.roleName}`]
    }));
    bucket.grantReadWrite(lambdaFunction);
    topic.grantPublish(lambdaFunction);

    const eventBridgeRule = new Rule(this, 'ScheduleRule', {
      ruleName: RESOURCE_NAME,
      schedule: Schedule.expression(props.cronExpression),
      targets: [ new targets.LambdaFunction(lambdaFunction)]
    });

    new cdk.CfnOutput(this, 'S3BucketName', {
      value: bucket.bucketName,
      description: 'S3 Bucket Name'
    });


    new cdk.CfnOutput(this, 'LambdaRoleArn', {
      value: lambdaFunction.role.roleArn,
      description: 'Lambda Role ARN'
    });

  }
}

module.exports = { AWSSecMonitorConstruct }
