# SDP

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.19.


## Project Setup

Project setup is completed in 2 parts. First is to setup to deploy the backend infrastructure, and the second is to serve the frontend application.


### Backend

To deploy the backend, execute the following steps:

1. `cd aws/infra/` (from the project root directory)
2. `./main.py -p <AWS account credentials text file>` (for details, see `./aws/infra/README.md`)
3. `cp confidential.json ../../src/` (for details, see `./aws/infra/README.md`)


### Frontend

1. `cd ./src` (from the project root directory)
2. `ng serve --host <external IP> --port <#>`
