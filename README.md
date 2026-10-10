# 🏥 HealthCare Management System

A full-stack healthcare management application built with the **MERN stack** to streamline medical representative activities, healthcare professional management, and field visit reporting.

## 📌 About the Project

HealthCare is a web application designed to help manage medical representatives (MRs), doctors, chemists, and field visit activities through a centralized platform.

The application enables medical representatives to record their visits, capture visit details, upload supporting photo evidence, and maintain organized records. It also supports manager-based access to visit information, helping simplify monitoring and reporting workflows.

The project focuses on building a practical, full-stack solution with secure authentication, structured REST APIs, and a responsive user interface.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, JavaScript |
| Styling & UI | Tailwind CSS, Lucide React |
| Forms & Validation | React Hook Form, Zod |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, Cookies |
| File Uploads | Multer, Cloudinary |
| API Communication | REST APIs |
| Deployment | Vercel |

## ✨ Features

### 👤 Authentication & Authorization
- Secure user authentication using JWT.
- Cookie-based authentication support.
- Protected routes for authenticated users.
- Credential-aware frontend and backend communication.

### 🩺 Healthcare Professional Management
- Manage doctor and chemist information.
- Retrieve healthcare professional records through API endpoints.
- Maintain relationships between medical representatives and their assigned professionals.

### 📍 Visit Management
- Record doctor and chemist visits.
- Capture visit notes and relevant details.
- Use geolocation to obtain location information.
- Support reverse geocoding to convert coordinates into readable addresses.
- Submit visit information to the backend through REST APIs.

### 📸 Visit Proof & File Uploads
- Upload multiple photos as visit evidence.
- Support file selection and drag-and-drop interactions.
- Preview and remove selected files before submission.
- Validate supported file types, including images and PDFs where applicable.
- Process uploads using Multer and Cloudinary integration.

### 📊 Visit Tracking & Reporting
- Store visit records in MongoDB.
- Retrieve visit proof records with associated medical representative, doctor, and chemist information.
- Support manager-based filtering of medical representatives' visit records.
- Organize visit data for monitoring and reporting workflows.

### 🖥️ Frontend Experience
- Reusable React components and API modules.
- Form validation with React Hook Form and Zod.
- Loading and error states for API operations.
- Responsive interface with consistent icons and page layouts.

## 📂 Project Structure

The project is organized into separate frontend and backend applications.

```text
healthCare/
├── frontend/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # Authentication context
│       ├── pages/          # Application pages
│       ├── services/       # API communication modules
│       └── ...             # Other application files
│
├── backend/
│   ├── models/             # Mongoose schemas and models
│   ├── routes/             # API route definitions
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Authentication and upload middleware
│   ├── public/
│   │   └── temp/           # Temporary upload storage
│   ├── app.js              # Express application setup
│   └── ...                 # Other server files
│
├── .gitignore
└── README.md
```

*Note: This is a logical overview of the project architecture. Update the tree to match the repository's exact filenames and directory names.*

### Frontend Responsibilities
- Rendering the user interface and application pages.
- Managing authentication state through React Context.
- Validating forms and collecting user input.
- Communicating with backend APIs.
- Handling visit submissions, geolocation, and file uploads.

### Backend Responsibilities
- Exposing RESTful API endpoints.
- Authenticating requests and protecting restricted routes.
- Managing healthcare professionals and visit records.
- Validating and processing uploaded files.
- Interacting with MongoDB through Mongoose.
- Integrating Cloudinary for file storage.

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- npm
- [MongoDB](https://www.mongodb.com/) or a MongoDB Atlas connection
- Cloudinary credentials for the configured upload workflow

### 1. Clone the Repository

```bash
git clone https://github.com/adwitiya-ag/healthCare.git
cd healthCare
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory and configure the environment variables expected by the application.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=your_frontend_url
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Use the actual variable names required by the backend code, and never commit real credentials.

Start the backend using the appropriate script defined in `package.json`:

```bash
npm run dev
```

### 3. Set Up the Frontend

Open a separate terminal:

```bash
cd frontend
npm install
```

Configure the frontend environment file with the backend API URL expected by the application.

For example, if the project uses Vite:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

*The commands and environment variable names above are examples; verify them against the scripts and configuration in the repository.*

## 🔐 Security Considerations

- Keep secrets and database credentials in environment variables.
- Protect authenticated endpoints with appropriate middleware.
- Validate request payloads and uploaded files on the server.
- Configure CORS and cookie settings for the frontend and backend deployment environments.
- Avoid exposing sensitive healthcare or user information in API responses and logs.

## 🎯 Project Goals

- Simplify medical representative field operations.
- Centralize healthcare professional and visit information.
- Improve visit verification through photo evidence and location data.
- Provide a maintainable full-stack architecture.
- Support more efficient monitoring of field activities.

## 👨‍💻 Tech Stack Summary

**MongoDB · Express.js · React.js · Node.js · JWT · Cloudinary**

