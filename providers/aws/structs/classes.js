const coreCdk = require('@aws-cdk/core');
const lambda = require("@aws-cdk/aws-lambda");
const api = require("@aws-cdk/aws-apigateway");
const eventSource = require("@aws-cdk/aws-lambda-event-sources");

module.exports = {
  LambdaCode: lambda.Code,
  Duration: coreCdk.Duration,
  SqsEventSource: eventSource.SqsEventSource
};
