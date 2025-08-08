# CreatorBase - Next.js Frontend

This is the Next.js version of the CreatorBase ERP application, a comprehensive management platform for content creators and SaaS development teams.

## 🚀 Features
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **Google OAuth** integration
- **JWT Authentication** with secure token management
- **Role-Based Access Control (RBAC)**
- **Real-time search** with keyboard navigation
- **Dark/Light theme** support
- **Responsive design** for all devices

## 🏗️ Architecture
### Project Structure
```
frontend-nextjs/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   ├── login/             # Authentication pages
│   │   ├── register/
│   │   └── app/               # Protected app pages
│   │       ├── layout.tsx     # App layout with sidebar
│   │       ├── dashboard/     # Dashboard pages
│   │       ├── users/         # User management
│   │       ├── projects/      # Project management
│   │       └── ...            # Other modules
│   ├── components/            # Reusable components
│   │   ├── ui/               # Base UI components
│   │   ├── Layout/           # Layout components
│   │   └── pages/            # Page components
│   ├── context/              # React Context providers
│   ├── services/             # API services
│   ├── lib/                  # Utility functions
│   └── types/                # TypeScript types
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running (see backend README)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ERP/frontend-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   
   # Google OAuth Configuration
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=852792982943-iadr4llqoiigtpkqc2blcfq25q00plv6.apps.googleusercontent.com
   
   # Frontend Configuration
   NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
   
   # Optional: Development Configuration
   NODE_ENV=development
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication Flow

1. **Login/Register**: Users can sign in with email/password or Google OAuth
2. **JWT Tokens**: Secure token-based authentication
3. **Protected Routes**: Automatic redirection for unauthenticated users
4. **Google OAuth**: Seamless Google sign-in integration

## 🔧 Google OAuth Setup

### Prerequisites
1. **Google Cloud Console Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable **Google+ API** and **Google Identity API**
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
   - Choose **Web application**
   - Add authorized origins:
     - `http://localhost:3000` (for development)
     - `https://your-domain.com` (for production)
   - Add authorized redirect URIs:
     - `http://localhost:3000` (for development)
     - `https://your-domain.com` (for production)

### Environment Variables
Make sure your `.env.local` file contains:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### Troubleshooting Google OAuth

#### Common Issues:

1. **"Invalid client" error**:
   - Check your Google Client ID in `.env.local`
   - Ensure the client ID matches in Google Cloud Console

2. **"Redirect URI mismatch"**:
   - Verify authorized redirect URIs in Google Console
   - Make sure `http://localhost:3000` is added for development

3. **"Token verification failed"**:
   - Ensure Google Client ID matches in both frontend and backend
   - Check that the backend has the correct `GOOGLE_CLIENT_ID` in its `.env`

4. **"Google sign-in failed"**:
   - Check browser console for detailed error messages
   - Verify that the backend is running on `http://localhost:5000`
   - Ensure the backend has the Google OAuth endpoint `/api/auth/google`

#### Debugging Steps:

1. **Check Console Logs**:
   - Open browser developer tools (F12)
   - Look for any error messages in the Console tab
   - Check Network tab for failed API requests

2. **Verify Backend Connection**:
   - Ensure backend is running: `cd ../backend && npm run dev`
   - Test API endpoint: `curl http://localhost:5000/api/auth/google/url`

3. **Check Environment Variables**:
   - Verify `.env.local` file exists in the correct location
   - Ensure all required variables are set
   - Restart the development server after changes

4. **Test Google OAuth Flow**:
   - Clear browser cache and cookies
   - Try signing in with Google again
   - Check if the Google consent screen appears

## 📁 Key Components

### Authentication
- **AuthContext**: Manages user authentication state
- **Protected Routes**: Automatic redirection for unauthenticated users
- **Google OAuth**: Seamless Google sign-in integration

### Layout System
- **RootLayout**: Global layout with providers
- **AppLayout**: Protected app layout with sidebar
- **Sidebar**: Navigation with role-based menu items
- **SearchBar**: Global search with keyboard navigation

### UI Components
- **Button**: Variant-based button component
- **Card**: Flexible card component
- **Input**: Form input component
- **Badge**: Status and label component
- **ThemeToggle**: Dark/light theme switcher

## 🎨 Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Dark Mode**: Automatic theme switching
- **Responsive Design**: Mobile-first approach

## 🔍 Search Functionality

- **Global Search**: Search across all modules
- **Keyboard Navigation**: Arrow keys and Enter to navigate
- **Recent Searches**: Persistent search history
- **Real-time Results**: Instant search suggestions

## 📊 State Management

- **React Context**: Global state management
- **Local Storage**: Persistent user preferences
- **Session Management**: Automatic token refresh

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-production-google-client-id
NEXT_PUBLIC_FRONTEND_URL=https://your-domain.com
NODE_ENV=production
```

## 🐛 Troubleshooting

### Common Issues

1. **Module not found errors**:
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript paths in `tsconfig.json`

2. **Styling issues**:
   - Verify Tailwind CSS is properly configured
   - Check if CSS classes are being applied

3. **Authentication issues**:
   - Ensure backend is running and accessible
   - Check environment variables
   - Verify JWT token is being sent with requests

4. **Google OAuth issues**:
   - See the Google OAuth Setup section above
   - Check browser console for error messages
   - Verify Google Cloud Console configuration

## 📝 Development

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (if configured)

### Testing
```bash
npm run lint
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 