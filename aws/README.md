# AWS
This directory contains source code that lives in and operates on the AWS cloud.


## Directory


### `infra/`
Contains the backend infrastructure deployment script (see `infra/README.md` for details).
The script utilizes code contained in `lambda/` (see below).


### `lambda/`
Contains code and mappings for all Lambda functions that fulfill API requests.
Each subfolder is organized by name of the API resource (letter case differs) with which each Lambda function is associated.
These functions all use Python 3.7.
