const lambda = require("@aws-cdk/aws-lambda");
const api = require("@aws-cdk/aws-apigateway");
const sqs = require("@aws-cdk/aws-sqs");

module.exports = {
  LambdaFunction: lambda.Function,
  RestApi: api.RestApi,
  SqsQueue: sqs.Queue
};



