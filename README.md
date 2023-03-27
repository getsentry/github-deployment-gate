# Github Sentry Deployment Gate

## Preparing GCP for Deployment

### GCP Setup

- Enable Google APIs:
  - Cloud Storage
  - Google Container Registry
  - Enable Google Cloud Run
  - Enable Google Compute Engine
  - Secret Manager
  - Google Cloud Scheduler
- Create a bucket
  - unprotected
  - add permission `alluser`: "Cloud Storage Object Viewer"
  - In the Google Cloud console, go to the Cloud Storage Buckets page, go to Buckets
  - In the list of buckets, find the bucket you created
  - Click the Bucket context menu button associated with the bucket and select Edit website configuration
  - In the website configuration dialog, set the main page and error page to `index.html`
- Create a service account
  - Cloud Storage Admin
  - Cloud Run Admin
  - Storage Admin
  - Google Cloud Run Service Agent
  - Compute Engine Service Agent
- In order to allow the Cloud Run service to access secrets, grant the Secret Manager Secret Accessor role to the Cloud Run service account:
  - Open Secret Manager
  - Select the secret and in the right side permissions tab, click Add Principal
  - In the New principals textbox, enter the service account email for your Cloud Run service
  - Grant it the role Secret Manager Secret Accessor
- Create a Load Balancer
  - add the public GCS bucket as a backend bucket
  - add the GCR service as another backend service
  - enable SSL
- Connect your domain to your load balancer
  - After the load balancer is created, note the IP address that is associated with the load balancer, for example, 1.2.3.4
  - create an A record like so: `www A 1.2.3.4`, `@ A 1.2.3.4`, etc

### App Secrets

Create these secrets in the secret manager:

```
POSTGRES_HOST
POSTGRES_DB
POSTGRES_PORT
POSTGRES_USER
POSTGRES_PASSWORD
SENTRY_CLIENT_ID
SENTRY_CLIENT_SECRET
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GITHUB_APP_PRIVATE_KEY
SENTRY_URL
GITHUB_APP_ID
GITHUB_APP_WEBHOOK_SECRET
ACCESS_TOKEN_SECRET
REFRESH_TOKEN_SECRET
DEPLOYMENT_REQUESTS_HANDLER
```

These secrets are exposed as environment variables.

### Google Cloud Scheduler Setup

Create a new job in Google Cloud Scheduler:

```
Frequency: * * * * *
Target Type: HTTP
URL: <value of DEPLOYMENT_REQUESTS_HANDLER>
HTTP Method: Post
Auth header: Add OIDC token
Audience: <value of DEPLOYMENT_REQUESTS_HANDLER>
```

Example:

```
Frequency: * * * * *
Target Type: HTTP
URL: https://www.sentrydeploymentgate.com/api/sentry/deployment-requests-handler
HTTP Method: Post
Auth header: Add OIDC token
Audience: https://www.sentrydeploymentgate.com/api/sentry/deployment-requests-handler
```
