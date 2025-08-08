# CreatorBase

A comprehensive management platform for content creators and SaaS development teams.

## Features

- **Team & HR Management** - Employee profiles, attendance tracking, leave management, payroll
- **Project & Task Management** - Project tracking, task management, time tracking, Kanban boards
- **Finance & Budgeting** - Income/expense tracking, budgeting, invoicing, financial reports
- **Analytics & Reporting** - YouTube analytics, team productivity, project progress, custom reports
- **Content & Course Operations** - YouTube content planning, shorts/reels management, course creation
- **User Roles & Permissions** - Role-based access control, module-specific permissions
- **Integrations** - YouTube, Slack, Stripe, Notion integrations

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Shadcn/UI
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT-based authentication
- **Database**: MongoDB with Mongoose ODM

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CreatorBase
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Update .env with your MongoDB URI and JWT secret
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Database Setup**
   ```bash
   cd backend
   node seed.js
   ```

### Default Admin Credentials

- **Email**: admin@erp.com
- **Password**: admin123

## Project Structure

```
CreatorBase/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── middleware/     # Custom middleware
│   └── server.js           # Express server
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── context/        # React context
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 