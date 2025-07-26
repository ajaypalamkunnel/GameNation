# 🎮 GameNation E-Commerce Platform

A modern, full-featured e-commerce web application specifically designed for gaming enthusiasts. Built with Node.js, Express.js, MongoDB, and EJS, GameNation provides a comprehensive platform for buying and selling gaming products online.

## 🚀 Live Demo

Visit the live application: [gamenation.online](https://gamenation.online)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🛍️ User Features
- **User Authentication & Authorization**
  - User registration and login
  - Google OAuth integration
  - Password reset functionality
  - Session management

- **Product Management**
  - Browse gaming products by categories
  - Advanced product search and filtering
  - Product reviews and ratings
  - Wishlist functionality
  - Product image gallery

- **Shopping Experience**
  - Shopping cart management
  - Multiple address management
  - Order tracking and history
  - Coupon and discount system
  - Wallet payment integration

- **Payment Processing**
  - Razorpay payment gateway integration
  - Wallet payment system
  - Secure checkout process
  - Order confirmation emails

### 👨‍💼 Admin Features
- **Dashboard**
  - Sales analytics and reporting
  - User management
  - Order management with status updates

- **Product Management**
  - Add, edit, and delete products
  - Category management
  - Image upload with Cloudinary integration
  - Inventory tracking

- **Order & Sales Management**
  - Order processing and status updates
  - PDF invoice generation
  - Sales reports (Excel export)
  - Customer management

- **Marketing Tools**
  - Coupon creation and management
  - Offer and discount management
  - Email notifications

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Template Engine:** EJS
- **Authentication:** Passport.js (Local & Google OAuth)
- **Session Management:** Express-session

### Frontend
- **Styling:** Tailwind CSS
- **JavaScript:** Vanilla JS with SweetAlert2
- **Layouts:** Express-EJS-Layouts

### Third-Party Services
- **Image Storage:** Cloudinary
- **Payment Gateway:** Razorpay
- **Email Service:** Nodemailer
- **PDF Generation:** PDFKit
- **Excel Export:** XLSX

### Development Tools
- **Process Manager:** Nodemon
- **Security:** Bcrypt for password hashing
- **File Upload:** Multer
- **Cache Control:** NoCache middleware

## 📁 Project Structure

```
GameNation/
├── config/                 # Configuration files
│   └── db.mjs              # Database connection
├── constants/              # Application constants
├── controller/             # Route controllers
│   ├── adminController/    # Admin-related controllers
│   └── userController/     # User-related controllers
├── middleware/             # Custom middleware
├── model/                  # Database schemas
│   ├── addressSchema.mjs   # User address model
│   ├── cartSchema.mjs      # Shopping cart model
│   ├── categorySchema.mjs  # Product category model
│   ├── couponSchema.mjs    # Coupon/discount model
│   ├── offerSchema.mjs     # Special offers model
│   ├── orderSchema.mjs     # Order management model
│   ├── productSchema.mjs   # Product model
│   ├── userSchema.mjs      # User model
│   ├── walletSchema.mjs    # User wallet model
│   └── wishListSchema.mjs  # Wishlist model
├── public/                 # Static assets
│   ├── css/               # Compiled CSS files
│   ├── js/                # Client-side JavaScript
│   └── images/            # Static images
├── routes/                 # Route definitions
│   ├── adminRoutes.mjs     # Admin routes
│   └── userRoutes.mjs      # User routes
├── services/               # Business logic services
│   └── auth.mjs           # Authentication service
├── src/                    # Source files
│   └── tailwind.css       # Tailwind source
├── uploads/                # File uploads directory
├── views/                  # EJS templates
│   └── layouts/           # Layout templates
├── .env                    # Environment variables
├── .gitignore             # Git ignore rules
├── app.mjs                # Main application file
├── package.json           # Dependencies and scripts
└── tailwind.config.js     # Tailwind configuration
```

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Step-by-step Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ajaypalamkunnel/GameNation.git
   cd GameNation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/gamenation
   
   # Server
   PORT=3000
   
   # Session Secret
   SESSION_SECRET=your_session_secret_here
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   # Razorpay
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   
   # Email (Nodemailer)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```

4. **Build Tailwind CSS**
   ```bash
   npm run build
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## ⚙️ Configuration

### Database Setup
Ensure MongoDB is running on your system. The application will automatically connect to the database specified in your `.env` file.

### Third-party Service Setup

1. **Cloudinary**: Sign up at [cloudinary.com](https://cloudinary.com) for image storage
2. **Razorpay**: Create an account at [razorpay.com](https://razorpay.com) for payment processing
3. **Google OAuth**: Set up OAuth credentials in [Google Console](https://console.developers.google.com)

## 🎯 Usage

### For Users
1. **Registration/Login**: Create an account or log in with existing credentials
2. **Browse Products**: Explore gaming products by categories
3. **Shopping**: Add items to cart, apply coupons, and proceed to checkout
4. **Payment**: Complete purchase using Razorpay or wallet
5. **Order Tracking**: Monitor order status and download invoices

### For Admins
1. **Admin Login**: Access admin panel with administrator credentials
2. **Product Management**: Add/edit products, manage categories and inventory
3. **Order Management**: Process orders, update status, and generate reports
4. **User Management**: Monitor user activities and manage accounts
5. **Analytics**: View sales reports and export data

## 📚 API Documentation

### Authentication Endpoints
- `POST /register` - User registration
- `POST /login` - User login
- `GET /logout` - User logout
- `GET /auth/google` - Google OAuth login

### User Endpoints
- `GET /home` - Home page
- `GET /products` - Product listing
- `GET /product/:id` - Product details
- `POST /cart/add` - Add to cart
- `POST /order/create` - Create order

### Admin Endpoints
- `GET /admin/dashboard` - Admin dashboard
- `POST /admin/product/add` - Add new product
- `GET /admin/orders` - Manage orders
- `GET /admin/users` - User management

## 🗄️ Database Schema

### Key Models
- **User**: User authentication and profile information
- **Product**: Gaming product details with categories
- **Cart**: Shopping cart items for each user
- **Order**: Order information and status tracking
- **Category**: Product categorization
- **Coupon**: Discount and promotion codes
- **Wallet**: User wallet for transactions
- **Wishlist**: User's saved favorite products

## 🤝 Contributing

We welcome contributions to GameNation! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Contribution Guidelines
- Follow the existing code style and structure
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ajay Palamkunnel** - [GitHub Profile](https://github.com/ajaypalamkunnel)

## 🙏 Acknowledgments

- Express.js community for the robust web framework
- MongoDB team for the flexible database solution
- Tailwind CSS for the utility-first CSS framework
- All contributors who helped improve this project

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/ajaypalamkunnel/GameNation/issues) page
2. Create a new issue with detailed information
3. Contact the maintainer through GitHub

---

⭐ **Star this repository if you found it helpful!**

Made with ❤️ for the gaming community
