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
