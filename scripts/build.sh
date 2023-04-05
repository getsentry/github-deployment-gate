#!/bin/bash

set -e

export REACT_APP_GITHUB_CLIENT_ID="Iv1.5008fddaf6c532b9"
export REACT_APP_SENTRY_DSN="https://47ec3abc9f494cf4a0ebe83c2a340c4c@o1.ingest.sentry.io/4504922570424320"

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
echo $SCRIPT_DIR
cd $SCRIPT_DIR/../frontend && npm run build || true
echo "mkdir -p $SCRIPT_DIR/../backend/src/public"
mkdir -p $SCRIPT_DIR/../backend/src/public
echo "cp -r $SCRIPT_DIR/../frontend/build/* $SCRIPT_DIR/../backend/src/public/"
cp -r $SCRIPT_DIR/../frontend/build/* $SCRIPT_DIR/../backend/src/public/
cd $SCRIPT_DIR/../backend; 
docker build \
  --platform linux/amd64 \
  --tag getsentry/github-deployment-gate:latest \
  .
