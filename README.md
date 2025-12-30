# 🏞️ Natours – Backend API and Views

Natours is the backend for the **Natours website** that provides an **API** to handle requests for booking, tours, users, and more. This backend uses **Node.js**, **Express**, **MongoDB**, **Mongoose**, and **Pug** (for views). It also employs **ESLint** for code quality.

The application includes several routes, controllers, views, and models, offering a complete backend solution for a tour booking platform.

---

## ✨ Features

- **RESTful API** to manage tours, bookings, and users
- **MongoDB** with **Mongoose** models for database interactions
- **Pug** for dynamic views rendered on the frontend
- **User authentication** using sessions and cookies
- **Custom error handling** and validation for API requests
- **ESLint** integrated for code quality and consistency

---

## 🛠️ Tech Stack

- **Node.js** - JavaScript runtime for the server
- **Express** - Web framework for handling routes and middleware
- **MongoDB** - NoSQL database for storing user and tour data
- **Mongoose** - ODM for MongoDB to define models and interact with data
- **Pug** - Templating engine for generating views
- **ESLint** - JavaScript linting tool to enforce coding standards

---

## 📁 Project Structure

natours-backend/

│

├── config/                    # Configuration files

│   ├── database.js            # MongoDB connection setup

│   └── env.js                 # Environment variables

│

├── controllers/               # Controllers for handling requests

│   ├── tourController.js      # Logic for handling tour-related requests

│   ├── userController.js      # Logic for handling user-related requests

│   └── bookingController.js   # Logic for handling booking requests

│

├── models/                    # Mongoose models

│   ├── tourModel.js           # Tour schema and model

│   ├── userModel.js           # User schema and model

│   └── bookingModel.js        # Booking schema and model

│

├── routes/                    # Express routes for API endpoints

│   ├── tourRoutes.js          # API routes for tours

│   ├── userRoutes.js          # API routes for users

│   └── bookingRoutes.js       # API routes for bookings

│

├── views/                     # Pug views for rendering HTML

│   ├── tourOverview.pug       # View for displaying tour details

│   └── bookingConfirmation.pug # View for booking confirmation

│

├── public/                    # Static files (CSS, JS, images)

├── .eslintrc.js               # ESLint configuration file

├── package.json               # Project metadata and dependencies

├── app.js                     # Main app setup (server, middleware, routes)

└── README.md                  # This file


---

## 🎨 Backend Architecture

### **Controllers**

- **tourController.js** - Handles requests related to **tour listings**, **tour details**, and other tour-related actions.
- **userController.js** - Handles user authentication, registration, and profile management.
- **bookingController.js** - Manages tour bookings, including creating, updating, and retrieving booking data.

### **Models**

- **tourModel.js** - Defines the **Tour** model with properties like title, description, price, and duration.
- **userModel.js** - Defines the **User** model with properties like name, email, password, and role.
- **bookingModel.js** - Defines the **Booking** model with properties like user, tour, booking date, and payment details.

### **Routes**

- **tourRoutes.js** - Contains all the routes related to **tours** (GET, POST, PUT, DELETE).
- **userRoutes.js** - Contains routes for **user authentication** and registration.
- **bookingRoutes.js** - Contains routes for handling **booking** requests.

---

## 🚀 Getting Started

### 1️⃣ Install Dependencies

Ensure you have **Node.js** and **MongoDB** installed, then run the following command to install all the project dependencies:

```bash
npm install
```

### 2️⃣ Set Up Environment Variables

Create a .env file in the root directory to configure your environment variables. This file should include:
```bash
PORT=3000
DB_URI=mongodb://localhost:27017/natours
SESSION_SECRET=your-secret-key
```
1. PORT: The port on which the server will run.
2. DB_URI: The URI for your MongoDB database.
3. SESSION_SECRET: A secret key used for session management.

### 3️⃣ Start the Server

Once dependencies are installed and environment variables are set, you can start the server by running:
```bash
npm start
```
This will run the app on http://localhost:3000 (or your specified port in the .env file).

### 📦 package.json Scripts

```bash
{
  "scripts": {
    "start": "node app.js",           # Start the server
    "dev": "nodemon app.js",           # Start the server in development mode with auto-reloading
    "lint": "eslint . --fix",          # Lint all files and auto-fix issues
    "test": "jest",                   # Run tests (if implemented)
    "build": "webpack --config webpack.config.js" # Build frontend assets (if applicable)
  },
  "devDependencies": {
    "nodemon": "^2.0.7",              # Development tool for auto-restarting server
    "eslint": "^7.32.0",              # Linting tool for JavaScript
    "mongoose": "^5.10.9",            # MongoDB ORM for Node.js
    "express": "^4.17.1",             # Web framework for Node.js
    "pug": "^3.0.2"                   # Pug templating engine
  },
  "dependencies": {
    "dotenv": "^10.0.0"               # For managing environment variables
  }
}
```

### 🧑‍🎓 Learning Purpose

This backend project is part of an Advanced Node.js and MongoDB course that focuses on:

  Creating a RESTful API with Express
  Using Mongoose for MongoDB integration
  Structuring Node.js apps with MVC (Model-View-Controller)
  Setting up user authentication and session management
  Writing clean and maintainable code with ESLint

### 🙌 Credits

This backend was built by Patrick Oliveira

Based on the Advanced Node.js course by Jonas Schmedtmann (Udemy)

Original design and course materials credit belongs to Jonas Schmedtmann

### 📄 License

This project is for educational purposes only.
