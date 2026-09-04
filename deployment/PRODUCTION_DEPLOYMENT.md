# Production Deployment: Linux Server

This guide deploys the React UI, Spring Boot backend, PostgreSQL connection, SMTP email, and Nginx on one Linux server.

Do not put production passwords in `backend/src/main/resources/application.yml` or `frontend/.env`. The backend file already reads its settings from environment variables.

## Values To Replace

Replace every value marked with `CHANGE_ME` before using the files below.

| Value | Example | Meaning |
| --- | --- | --- |
| `CHANGE_ME_DOMAIN` | `portal.example.com` | Public domain name for the application |
| `CHANGE_ME_DB_HOST` | `localhost` | PostgreSQL host. Use `localhost` only when PostgreSQL is on this server |
| `CHANGE_ME_DB_NAME` | `project_management` | Existing PostgreSQL database name |
| `CHANGE_ME_DB_USER` | `project_app` | Existing PostgreSQL user |
| `CHANGE_ME_DB_PASSWORD` | `...` | PostgreSQL password |
| `CHANGE_ME_JWT_SECRET` | random 64+ character value | Application signing secret |
| `CHANGE_ME_SMTP_HOST` | `smtp.office365.com` | SMTP provider host |
| `CHANGE_ME_SMTP_PORT` | `587` | SMTP provider port |
| `CHANGE_ME_SMTP_USERNAME` | `noreply@example.com` | SMTP login username |
| `CHANGE_ME_SMTP_PASSWORD` | `...` | SMTP password or app password |
| `CHANGE_ME_FROM_ADDRESS` | `noreply@example.com` | Email sender address |

## Server Prerequisites

Install Java 17, Nginx, Node.js 20+, and PostgreSQL client tools. PostgreSQL itself is only needed on this server if your existing database is hosted here.

```bash
sudo apt update
sudo apt install -y openjdk-17-jre-headless nginx postgresql-client
```

Create the service user and application directories:

```bash
sudo useradd --system --home /opt/project-management --shell /usr/sbin/nologin projectapp
sudo mkdir -p /opt/project-management/backend
sudo mkdir -p /var/www/project-management
sudo mkdir -p /etc/project-management
sudo chown -R projectapp:projectapp /opt/project-management
sudo chmod 700 /etc/project-management
```

## 1. Backend Environment File

On the Linux server, create `/etc/project-management/backend.env`:

```env
# Database: replace with credentials for the existing PostgreSQL database.
DB_HOST=CHANGE_ME_DB_HOST
DB_PORT=5432
DB_NAME=CHANGE_ME_DB_NAME
DB_USERNAME=CHANGE_ME_DB_USER
DB_PASSWORD=CHANGE_ME_DB_PASSWORD

# Backend network configuration. Nginx is the public endpoint.
SERVER_PORT=8080
JPA_DDL_AUTO=update
JPA_SHOW_SQL=false

# Generate a unique long random value. Never commit it to Git.
JWT_SECRET=CHANGE_ME_JWT_SECRET
JWT_EXPIRATION_MS=3600000

# Public browser URL used in invitation and password-reset links.
FRONTEND_BASE_URL=https://CHANGE_ME_DOMAIN

# SMTP credentials. For Gmail, use an App Password. For Microsoft 365 use port 587.
MAIL_HOST=CHANGE_ME_SMTP_HOST
MAIL_PORT=CHANGE_ME_SMTP_PORT
MAIL_USERNAME=CHANGE_ME_SMTP_USERNAME
MAIL_PASSWORD=CHANGE_ME_SMTP_PASSWORD
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS_ENABLE=true
APP_MAIL_FROM=CHANGE_ME_FROM_ADDRESS

# Persistent uploads outside the deployed JAR directory.
KNOWLEDGE_BASE_STORAGE_DIR=/opt/project-management/uploads/knowledge-base
```

Secure this file because it contains secrets:

```bash
sudo chown root:projectapp /etc/project-management/backend.env
sudo chmod 640 /etc/project-management/backend.env
sudo mkdir -p /opt/project-management/uploads/knowledge-base
sudo chown -R projectapp:projectapp /opt/project-management/uploads
```

## 2. Build And Copy The Backend

Build on a machine with Java 17 and Maven, then copy the generated JAR to the server:

```bash
cd backend
./mvnw clean package -DskipTests
scp target/project-management-0.0.1-SNAPSHOT.jar USER@SERVER:/tmp/project-management.jar
```

On the Linux server:

```bash
sudo mv /tmp/project-management.jar /opt/project-management/backend/project-management.jar
sudo chown projectapp:projectapp /opt/project-management/backend/project-management.jar
```

## 3. Backend Systemd Service

Create `/etc/systemd/system/project-management.service`:

```ini
[Unit]
Description=Project Management Portal Backend
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=projectapp
Group=projectapp
WorkingDirectory=/opt/project-management/backend
EnvironmentFile=/etc/project-management/backend.env
ExecStart=/usr/bin/java -jar /opt/project-management/backend/project-management.jar
SuccessExitStatus=143
Restart=on-failure
RestartSec=10

# Basic service hardening while preserving upload access.
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Enable and start the backend:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now project-management
sudo systemctl status project-management
sudo journalctl -u project-management -f
```

The backend must show as `active (running)` before continuing.

## 4. Build The Frontend

For production, the browser must call the same server through `/api`. Before building, create or change `frontend/.env.production` locally:

```env
VITE_API_BASE_URL=/api
VITE_DEFAULT_USER_ID=1
VITE_USE_TASK_DETAILS_MOCK=false
```

Build and copy the static files:

```bash
cd frontend
npm ci
npm run build
scp -r dist/* USER@SERVER:/tmp/project-management-ui/
```

On the Linux server:

```bash
sudo rm -rf /var/www/project-management/*
sudo cp -r /tmp/project-management-ui/* /var/www/project-management/
sudo chown -R www-data:www-data /var/www/project-management
```

`VITE_API_BASE_URL` is embedded at build time. Rebuild the UI every time this value changes.

## 5. Nginx Configuration

Create `/etc/nginx/sites-available/project-management`:

```nginx
server {
    listen 80;
    server_name CHANGE_ME_DOMAIN;

    root /var/www/project-management;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable it and validate Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/project-management /etc/nginx/sites-enabled/project-management
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

## 6. HTTPS Certificate

Point `CHANGE_ME_DOMAIN` DNS to your Linux server public IP, then install a certificate:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d CHANGE_ME_DOMAIN
```

After HTTPS works, the app URL is:

```text
https://CHANGE_ME_DOMAIN
```

Only allow inbound ports `80` and `443` in the server or cloud firewall. Do not publicly expose port `8080` or PostgreSQL port `5432`.

## 7. Final Checks

```bash
curl http://127.0.0.1:8080/swagger-ui.html
curl -I http://127.0.0.1
sudo systemctl status project-management nginx
```

Test these application actions after deployment:

1. Log in through the public HTTPS URL.
2. Create or invite a user and confirm an SMTP email arrives.
3. Use the invitation or password reset link and confirm it opens the public domain.
4. Upload and open a knowledge-base attachment.

## Updating The Application Later

1. Build a new backend JAR and frontend `dist` directory.
2. Replace the JAR in `/opt/project-management/backend/project-management.jar`.
3. Replace files in `/var/www/project-management/`.
4. Run `sudo systemctl restart project-management`.
5. Run `sudo systemctl reload nginx` only when its configuration changes.
