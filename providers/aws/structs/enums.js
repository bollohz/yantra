const lambda = require("@aws-cdk/aws-lambda");
const api = require("@aws-cdk/aws-apigateway");

module.exports = {
  LambdaRuntime: lambda.Runtime,
  LambdaRuntimeFamily: lambda.RuntimeFamily
};
