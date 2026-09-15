# QR Visitor Management System

A web-based QR Visitor Management System designed to simplify visitor registration, approval, entry, and exit tracking. The system allows reception staff to create digital visitor passes, security personnel to scan QR codes for verification, and administrators to monitor visitor activity.

## Features

* Visitor registration and digital QR pass generation
* QR-based visitor entry and exit verification
* Visitor approval and pass management
* Role-based access for Admin and Security users
* Visitor activity and status tracking
* Pass status management including Active, Used, Expired, and Revoked
* Visitor details including host, department, purpose, vehicle, ID proof, and validity period
* Dashboard for monitoring visitor activities and statistics
* Secure authentication and user management

## Technology Stack

### Frontend

* React
* TypeScript
* Tailwind CSS
* ShadCN UI
* TanStack Router
* Vite

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt

## Project Structure

```text
QR Visitor Management System
│
├── frontend
│   ├── components
│   ├── pages
│   ├── routes
│   └── ...
│
├── backend
│   ├── routes
│   ├── models
│   ├── controllers
│   └── ...
│
└── README.md
```

## How It Works

1. Reception staff registers a visitor and enters the required details.
2. The system generates a unique QR-based visitor pass.
3. The visitor presents the QR pass at the security checkpoint.
4. Security scans the QR code to verify the pass.
5. The system records the visitor's entry and exit activity.
6. Administrators can monitor visitor records and system activity through the dashboard.

## Installation

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* MongoDB

### Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-name>
```

### Install Dependencies

```bash
npm install
```

If the project contains separate frontend and backend folders:

```bash
cd frontend
npm install

cd ../backend
npm install
```

### Run the Application

Start the backend:

```bash
npm run dev
```

Start the frontend:

```bash
npm run dev
```

The application can then be accessed through the local development URL shown in the terminal.

## User Roles

### Admin

* Manage users
* Monitor visitor activity
* View visitor statistics
* Manage visitor passes

### Security

* Scan visitor QR codes
* Verify visitor passes
* Record entry and exit
* Check pass validity

## Security

The application uses authentication and authorization mechanisms to protect user accounts and restrict access based on user roles.

## Future Enhancements

* Email/SMS notifications for visitor approvals
* Advanced visitor analytics
* Automatic ID verification
* Cloud deployment
* Improved reporting and export functionality

## Author

**Haripriya P.**

B.Tech Artificial Intelligence and Data Science
Bannari Amman Institute of Technology
