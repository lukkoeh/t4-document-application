# T4-Documents
## Description
This repository contains all the files you need to run this application.
### Features
- Create Documents
- Edit Documents
- Delete Documents
- View Documents
- Share Documents
- Live Multi User Editor (Rich Text!)
- Edit your Profile
- Create your Accounts
- Update your Password
- Delete your Account

### Components
The application uses 3 main components, which are necessary to run it properly:
1. The Vue.js Frontend
2. The PHP RESTful API (for non time sensitive communication)
3. The PHP WebSocket Realtime Server (for time sensitive communication)

## Installation
To run this application, docker is the only supported way. However, there are certainly other options.
### Prerequisites
- Docker
- Docker Compose
- Internet Connection

### Platform Compatibility
This application was tested on the following platforms:
- Windows 11 Pro (23H2) - Docker Desktop 4.25.0 - WSL Integration
### Run the application
Running the application via docker is made very easy on purpose. Just run:
```powershell
docker compose up -d
```
This will install the following services via docker compose:
1. A Container for the Frontend (node:18)
2. A Container for the RESTful API (php:8.2-apache)
3. A Container for the WebSocket Server (php:8.2-cli)
4. A Container for the Database (mariadb:latest)
5. A Container for swagger UI to view the OpenAPI Specification (swaggerapi/swagger-ui)

### Where do I find the Database Layout?
The database layout is located at './layout.sql' and can be imported manually.

**Note:** Usually the database layout is automatically created on docker compose up.

### Where can I access this application?
The application is accessible via http://localhost:10000

The API is accessible via http://localhost:10001

The WebSocket Server is accessible via http://localhost:10002

The database is accessible via http://localhost:10003

Optionally, swaggerui is accessible via http://localhost:10004

Make sure that port forwarding to docker works correctly on your system.

### How do I edit the database configuration?
The database configuration is located at:
- ./api/src/DatabaseSingleton.php
- ./server/src/DatabaseSingleton.php

Edit the static values so that it fits your needs. Make sure that the SocketServer and the API use the same database.

### Database connection troubleshooting
If you have trouble connecting to the database, try one of the following:
1. Does your database container run?
2. Does host.docker.internal resolve to your docker host inside containers?
3. Does your database container have the correct port forwarding?
4. Does your database container have the correct network?
5. Does your database container have the correct environment variables?
6. Restart your computer and try again...