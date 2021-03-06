# SDP: AWS Cloud Project Management Application

An Angular 8 web application for managing collections of Amazon Web Services (AWS) resources.
This application serves as our Senior Design Project (SDP) for the Computer Science program at the University of Connecticut.


## Project Setup

Setup is completed in 2 parts. The first is to setup to deploy the backend infrastructure, and the second is to serve the frontend application.


### Backend

To deploy the backend, execute the following steps:

1. `cd aws/infra/` (from the project root directory)
2. `./main.py -p <AWS account credentials text file>` (for details, see `./aws/infra/README.md`)
3. `cp confidential.json ../../src/` (for details, see `./aws/infra/README.md`)


### Frontend

1. `cd ./src` (from the project root directory)
2. `ng serve --host <external IP> --port <#>`


## Noteworthy AWS Behavior & Obstacles

1. DynamoDB tables must **NOT** be created with any keys other than the parition and sort keys, and their attributes must map 1-to-1.
Any other keys will automatically be added when data containing it is inserted into the table.

2. The `IntegrationHTTPMethod` key under `Integration` under `Properties` for a resource with type `AWS::ApiGateway::Method` must contain the value `POST`, regardless of the HTTP method it fulfills.
The actual method is specified with the key `HttpMethod` under `Properties`.

3. When creating an EC2 Instance, the default security group does not open any port for SSH.
To resolve this, a new security group that opens a desired port must be created.

4. EC2 instances can be instructed to run a **BASH** script once creation is completed (for an example, see the `UserData` key under the `add_ec2_instance` function in `./aws/infra/template.py` or the `addEC2Instance` function in `./src/template.ts`).

5. When CloudFormation is peforming an action with a status ending with `_IN_PROGRESS`, subsequent commands will **NOT** be queued and the client the initiated the request will **NOT** be notified.
Status updates must be **polled**.

6. CloudFormation does **NOT** namespace resources.
Therefore, if a resource with a certain name/id already exists in one CloudFormation stack, the creation of another resource with the same name/id in another stack will fail.
A simple workaround we applied was to prefix resource names & ids with the name of the stack.

7. **AWS Resource names have a character limit.**

8. CloudFormation stacks cannot be created without at least 1 resource defined.
Our solution is to track/store the template in the database.
On submission of an a resource creation form, check if a resource exists, and if not we create the stack, otherwise we update the stack.
However, **there is currently no logic that waits for the stack to finish creating/updating**.

## Last updated: 5/1/2020
