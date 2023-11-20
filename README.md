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
### Run the application
Running the application via docker is made very easy on purpose. Just run:
```bash
docker-compose up -d
```
This will install the following services via docker compose:
1. A Container for the Frontend (node:18)
2. A Container for the RESTful API (php:8.2-apache)
3. A Container for the WebSocket Server (php:8.2-cli)
4. A Container for the Database (mariadb:latest)

### Where do I find the Database Layout?
The database layout is located at './layout.sql' and can be imported manually.

### Where can I access this application?
The application is accessible via http://localhost:10000

The API is accessible via http://localhost:10001

The WebSocket Server is accessible via http://localhost:10002

The database is accessible via http://localhost:10003

### How do I edit the database configuration?
The database configuration is located at:
- ./api/src/DatabaseSingleton.php
- ./server/src/DatabaseSingleton.php

Edit the static values so that it fits your needs. Make sure that the SocketServer and the API use the same database.