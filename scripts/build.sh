#!/bin/bash

set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR/../frontend; 
npm run build
mkdir -p $SCRIPT_DIR/../backend/src/public
cp -r $SCRIPT_DIR/../frontend/build/* $SCRIPT_DIR/../backend/src/public/
cd $SCRIPT_DIR/../backend; 
docker build \
  --platform linux/amd64 \
  --tag getsentry/github-deployment-gate:latest \
  .
