#!/bin/bash

set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR/../frontend; 
npm run build
mkdir $SCRIPT_DIR/../backend/src/public
cp -r $SCRIPT_DIR/../frontend/build/* $SCRIPT_DIR/../backend/src/public/
cd $SCRIPT_DIR/../backend; 
docker buildx build \
  --platform linux/arm/v7,linux/arm64/v8,linux/amd64 \
  --tag getsentry/github-deployment-gate:latest \
  .
