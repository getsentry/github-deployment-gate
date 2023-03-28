# Github Sentry Deployment Gate

## Usage

- Install the Github app in your repo via app link: https://github.com/apps/sentrydeploymentgate
- After installation you will be redirected to the application login page.
- Login to your Sentry account, go to Settings, click on Integrations and search for the Sentry integration.
- Click on "Accept and Install".
- Once you install the Sentry integration you will be redirected to the web application where you need to login via Github in order to connect your account with the Sentry account.

`Note: Your login details can only be connected to one Sentry account. If you install Sentry integration in another account and try to connect with same Github login, then the application will no longer be able to fetch issue from the previous Sentry account releases.`

- You will be able to see all the Github repos after login into the web application where you can configure the wait time for which the application will keep looking for any new issue before passing/rejecting the deployment gate.
- Once any deployment starts in any of the github repo where the Github app is installed, a new deployment gate request will appear with in a minute under "Pending deployment request" section in the web app.
- Application will start looking for any new issue in the corresponding Sentry release. If it finds any issue within the configured time frame then it will reject the deployment else it will pass the deployment after completion of the wait time
- Application also provides you options to manually approve and reject the deployment gate.

## Development

1. Run `npm install` inside [backend](./backend/) and [frontend](./frontend/) directories
2. Create and populate `.env` files inside `backend` and `frontend` directories (see [.env.sample](./.env.sample))
3. Start the `backend` dev server: `npm run dev`. Remember to point it to a postgres database using env vars (see [.env.sample](./.env.sample))
4. Start the `frontend` dev server: `npm run start`

### Production Build

#### Frontend

```sh
cd frontend
npm run build
```

The generated static assets inside the `build` directory can be hosted on github pages, s3 or google cloud storage bucket, etc

#### Backend

```sh
cd backend
docker build -t image:tag .
```

The backend is stateless and can be deployed to serverless containers like AWS ECS, Google Cloud Run.

### Github Workflow

Github workflows are set up to deploy the application to GCP. Here are the required vars and secrets:

Secrets:

- `GCP_SERVICE_KEY_JSON`
- `GH_CLIENT_ID`
- `SENTRY_DSN`

Variables:

- `GCP_PROJECT_ID`
- `GCR_REGION`
- `GCR_SERVICE_NAME`
- `GCS_BUCKET`

## GCP Infrastructure Setup

### With Terraform

1. Create an IAM service account with these roles:

   - Cloud Run Admin
   - Cloud Scheduler Admin
   - Cloud Scheduler Service Agent
   - Compute Instance Admin (beta)
   - Compute Load Balancer Admin
   - Compute Viewer
   - Secret Manager Admin
   - Security Reviewer
   - Storage Admin
   - IAM Admin
   - Service Usage Admin

2. Download and activate the service account key
3. Run [infra/scripts/enable_apis.sh](./infra/scripts/enable_apis.sh). Enable the IAM API manually
4. Populate [variables.tf](./infra/variables.tf) and create `terraform.tfvars` (see [terraform.tfvars.example](./infra/terraform.tfvars.example))
5. Run `terraform init` followed by `terraform apply` inside the [infra](./infra/) directory
6. After a successful run the IP address of the load balancer is displayed in the console. Connect your domain/subdomain by creating an A record like so: `www A 1.2.3.4`, `@ A 1.2.3.4`, etc

Note: Provisioning the SSL Certificate can take upwards of 30 minutes after the DNS A record is created

### Manual Setup

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
  - After the load balancer is created, copy the IP address associated with it
  - Connect your domain/subdomain by creating an A an A record like so: `www A 1.2.3.4`, `@ A 1.2.3.4`, etc
