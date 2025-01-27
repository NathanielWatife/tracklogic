# TrackLogic - Logistics Management System

## Project Overview
TrackLogic is a full-stack logistics management system that allows users to register, log in, track packages, manage shipments, and contact support. The project includes backend APIs and a frontend interface for seamless logistics operations.

## Key Features
- **Tracking System**: 
  - Unique tracking ID generation
  - Real-time package tracking
- **Authentication**:
  - Secure driver authentication
  - Package authentication
- **Shipping Management**:
  - Interstate shipping support
  - Intrastate shipping support
- **Payment Integration**
- **Service Dropdown Menu**
- **About Page**

## User Features
- **User Registration**:
  - Users can sign up with their name, email, phone number, and password.
- **User Login**: 
  - Authenticate using email and password.
- **Profile Management**: 
  - View and update profile details.
- **Track Packages**: 
  - Real-time package tracking via tracking ID.
- **Request Shipments**: 
  - Create and manage shipment requests, including delivery addresses and transit types.
- **Contact Support**: 
  - Send messages to customer support for assistance.
- **Admin Features (Optional if admin functionality is kept)**
- **Manage users**: 
  - View, promote, or delete users.
- **Manage packages**: 
  - Update package statuses and assign drivers.
- **Manage drivers**: 
  - Add and manage driver details.
Generate passwords for other admins during account creation.

## Technology Stack
- **Frontend**: 
  - HTML5
  - CSS3
  - Vanilla JavaScript

- **Backend**:
- Node.js with Express.js
- MongoDB (Database)
- Mongoose (ODM)
- JWT (Authentication)
- Nodemailer (Email functionality)

## Project Structure
```
TrackLogic/
│
├── index.html
├── tracking.html
├── authentication.html
├── shipping.html
├── payment.html
├── drivers.html
│
├── css/
│   ├── main.css
│   ├── responsive.css
│   └── theme.css
│
├── js/
│   ├── tracking.js
│   ├── auth.js
│   ├── shipping.js
│   ├── payment.js
│   └── drivers.js
│
└── assets/
    ├── images/
    └── icons/

backend/
├── controllers/         # All controller logic for handling requests
├── middlewares/         # Middleware for authentication and authorization
├── models/              # Mongoose schemas for database collections
├── routes/              # API route definitions
├── utils/               # Utility functions (e.g., email handling)
├── server.js            # Main entry
```

## Development Challenges & Solutions

### 1. Tracking ID Implementation
- **Challenge**: Creating a unique, secure tracking mechanism
- **Solution**: 
  - Generated alphanumeric tracking codes
  - Implemented validation logic
  - Ensured code uniqueness

### 2. Authentication System
- **Challenge**: Secure user and driver authentication
- **Solution**:
  - Client-side form validation
  - Secure local storage of credentials
  - Role-based access control

### 3. Responsive Design
- **Challenge**: Ensuring cross-device compatibility
- **Solution**:
  - Implemented flexible CSS grid/flexbox
  - Media query breakpoints
  - Mobile-first design approach

## Future Roadmap
- Backend integration
- Advanced error handling
- Real payment gateway
- Enhanced security features
- Comprehensive testing suite

## Local Setup
1. Clone repository
2. Open `index.html` in browser
3. Explore project functionalities

## Contributing
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## Contact
- Project Repository: [\[GitHub Link\]](https://github.com/NathanielWatife/tracklogic)

