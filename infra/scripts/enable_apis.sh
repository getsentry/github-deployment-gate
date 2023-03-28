#!/bin/sh

echo "Enabling GCP APIs..."

gcloud services enable \
  secretmanager.googleapis.com \
  compute.googleapis.com \
  containerregistry.googleapis.com \
  storage.googleapis.com \
  run.googleapis.com \
  cloudscheduler.googleapis.com \
  iam.googleapis.com

echo "Done"
