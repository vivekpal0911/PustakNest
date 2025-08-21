# MERN Online Bookstore

A full-stack online bookstore application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- User authentication and authorization
- Book browsing and search functionality
- Shopping cart and wishlist
- Order management
- Admin dashboard for book and user management
- Responsive design with Bootstrap

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd OnlineBookStore
```

### 2. Install server dependencies
```bash
cd server
npm install
```

### 3. Install client dependencies
```bash
cd ../client
npm install
```

### 4. Environment Setup

Create a `.env` file in the server directory with the following variables:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bookstore
JWT_SECRET=your_jwt_secret_key_here_12345
```

**Note:** If you don't have MongoDB installed locally, you can use MongoDB Atlas or update the MONGODB_URI accordingly.

### 5. Database Setup

Make sure MongoDB is running on your system. If you're using a local installation:

```bash
# Start MongoDB (Windows)
net start MongoDB

# Start MongoDB (macOS/Linux)
sudo systemctl start mongod
```

### 6. Seed the Database (Optional)

To populate the database with sample books:

```bash
cd server
npm run seed
```

## Running the Application

### 1. Start the Server
```bash
cd server
npm start
# or for development with auto-restart
npm run dev
```

The server will start on `http://localhost:5000`

### 2. Start the Client
```bash
cd client
npm start
```

The client will start on `http://localhost:3000`

## Troubleshooting

### Common Issues

1. **"Cannot read properties of undefined (reading 'page')" Error**
   - This usually occurs when the backend server is not running
   - Make sure MongoDB is running and accessible
   - Check if the server is running on port 5000
   - Verify the database connection in the server console

2. **Database Connection Issues**
   - Ensure MongoDB is running
   - Check your MONGODB_URI in the .env file
   - If using MongoDB Atlas, ensure your IP is whitelisted

3. **Port Already in Use**
   - Change the PORT in the .env file
   - Kill processes using the default ports

4. **CORS Issues**
   - The server is configured to allow requests from `http://localhost:3000`
   - If you change the client port, update the CORS configuration in `server/server.js`

### Database Check

To verify your database connection and content:

```bash
cd server
node scripts/checkDatabase.js
```

This will show:
- Connection status
- Number of books in the database
- Available indexes

## Project Structure

```
OnlineBookStore/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context providers
│   │   └── services/      # API services
│   └── public/            # Static files
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── scripts/           # Database scripts
└── README.md
```

## API Endpoints

- `GET /api/health` - Server health check
- `GET /api/books` - Get all books with pagination
- `GET /api/books/categories` - Get book categories
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
