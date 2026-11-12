# Somos Cardoso

Responsive family home, authentication and Secret Santa pages. Requires the companion Kotlin/Spring Boot API and MySQL for real accounts and draws.

## Develop locally

1. Follow the API repository docs/SECRET_SANTA_SETUP.md to start MySQL and the backend on port8080.
2. Copy .env.example to .env.local, then npm ci and npm run dev.
3. Open http://localhost:3000/auth. Register at least two players with WhatsApp numbers to create the first draw.

API requests use same-origin session cookies and CSRF tokens. Google sign-in is enabled only when the API is configured. WhatsApp delivery is disabled until Meta credentials and a template are configured.

The API_INTERNAL_URL rewrite target is captured during next build. For the existing Dockerfile, pass --build-arg API_INTERNAL_URL=http://api:8080 (the default) when frontend and API share a Docker network. Never place provider secrets in NEXT_PUBLIC variables.

Checks: npm run lint, npx tsc --noEmit, npm run build, npm test.

## Production deployment

Every push to `main` runs `.github/workflows/ci-main.yaml`. The workflow lints
in GitHub Actions, connects over SSH, runs `git pull --ff-only origin main` in
`~/apps/somos-cardoso`, installs dependencies, builds, and starts or reloads the
`somos-cardoso` PM2 process on port 3000. It then checks HTTP health. Each run
pulls the latest `main` available when deployment starts.

Before the first deployment:

1. Provision a Linux server with Git, Bash, Node.js 22, npm, curl, and PM2
   (`npm install -g pm2`). Make these commands available to the SSH user;
   the workflow also loads `~/.nvm/nvm.sh` if present.
2. Clone the repository's `main` branch into `~/apps/somos-cardoso` as the
   deployment user. Configure that user's Git credentials or read-only deploy
   key so `git pull` works without prompts, including trusted Git host keys
   when using SSH. Keep tracked files clean and the checkout on `main`.
   Add the Actions deployment public SSH key to `~/.ssh/authorized_keys`.
3. Add repository Actions secrets: `USER` (SSH username), `SERVER` (host/IP),
   `SSH-KEY` (private key), and `SSH_KNOWN_HOSTS` (the server's OpenSSH known-hosts
   entry, verified against the server's host key through a trusted channel).
   SSH uses the default port 22.
4. If needed, create `~/apps/somos-cardoso/.env.production` on the server for
   build-time and runtime environment values. Keep this file untracked.
5. Configure your domain, HTTPS, and reverse proxy to port 3000. Run `pm2 startup`
   as the deployment user and execute the command it prints so saved processes
   return after a reboot. The workflow runs `pm2 save` after successful deploys.

Deployment updates and builds the checkout in place, which can affect the running
app during installation or building. Failed deployments require manual recovery;
the workflow does not automatically roll back.

## Languages

The authentication, home and Secret Santa pages support Brazilian Portuguese
(default) and English. Use the PT-BR / EN buttons to switch without losing form
values. The preference is saved in this browser and applies across pages; dates,
labels, accessibility text and known API error messages follow that preference.

Phone forms send `phoneNumber` as entered, including national numbers such as
`(11) 99999-9999`. The API validates and normalizes the value, using country code
`+55` when omitted. Account responses expose the UUID `userId` separately from
the numeric player `id`, which remains the identifier used in draws.
