#!/bin/bash

set -e 

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

cd $SCRIPT_DIR/../backend; npm install
cd $SCRIPT_DIR/../frontend; npm install