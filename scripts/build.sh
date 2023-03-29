#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR/../frontend; 
npm run build
cp -r $SCRIPT_DIR/../frontend/build/* $SCRIPT_DIR/../backend/src/public/
cd $SCRIPT_DIR/../backend; 
docker build -t mikejihbe/github-deployment-gate:latest .
docker push mikejihbe/github-deployment-gate:latest