#!/bin/bash

aws lambda invoke --function-name AWSSecMonitor /dev/stdout | jq .body -r
