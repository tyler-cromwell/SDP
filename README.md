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
