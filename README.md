# Github Sentry Deployment Gate

## Usage

- Install the Github app in your repo via app link: https://github.com/apps/sentry-deployment-gate
- After installation you will be redirected to the application login page.
- Login to your Sentry account, go to Settings, click on Integrations and search for the Sentry integration.
- Click on "Accept and Install".
- Once you install the Sentry integration you will be redirected to the web application where you need to login via Github in order to connect your account with the Sentry account.

**_Note:_** _Your login details can only be connected to one Sentry account. If you install Sentry integration in another account and try to connect with same Github login, then the application will no longer be able to fetch issue from the previous Sentry account releases._

- Upon login, you will be able to see all the Github repositories where you personally have installed the github application. The web application will allow you to configure the wait time for which the application will keep looking for any new issue before passing/rejecting the deployment gate.
- Once any deployment starts in any of the github repo where the Github app is installed, a new deployment gate request will appear with in a minute under "Pending deployment request" section in the web app.
- Application will start looking for any new issue in the corresponding Sentry release. If it finds any issue within the configured time frame then it will reject the deployment else it will pass the deployment after completion of the wait time
- Application also provides you options to manually approve and reject the deployment gate.

## Development

1. Run `npm install` inside [backend](./backend/) and [frontend](./frontend/) directories
2. Create and populate `.env` files inside `backend` and `frontend` directories (see [.env.sample](./.env.sample))
3. Start the `backend` dev server: `npm run dev`. Remember to point it to a postgres database using env vars (see [.env.sample](./.env.sample))
4. Start the `frontend` dev server: `npm run start`

### Production Build

These build tasks are encapsulated in:
```
./scripts/setup.sh
./scripts/build.sh
```

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
