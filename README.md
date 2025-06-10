# Spectacular Recovery & Collection Services (SRCS) Website

A modern, responsive website for Spectacular Recovery & Collection Services featuring a blog system, contact form, and admin dashboard.

## Features

- **Modern Dark UI**: Sleek dark theme with racing green accents
- **Responsive Design**: Works on all device sizes
- **Blog System**: Create, read, update, and delete blog posts
- **Admin Dashboard**: Secure admin interface for content management
- **Contact Form**: Easy way for visitors to get in touch
- **Privacy Policy**: Built-in privacy policy modal

## Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Firebase account

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Eccentric-jamaican/SRCS.git
   cd SRCS
   ```

2. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Google sign-in method)
   - Create a Firestore database in test mode
   - Get your Firebase config object

3. **Configure Firebase**
   - Copy the Firebase config object
   - Create a file at `public/js/firebase-config.js`
   - Update the config values with your Firebase project details

4. **Install dependencies**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

5. **Deploy**
   ```bash
   firebase init
   firebase deploy
   ```

## Project Structure

```
SRCS/
├── public/                 # Static files
│   ├── css/                # Stylesheets
│   │   └── styles.css      # Custom styles
│   ├── js/                 # JavaScript files
│   │   ├── app.js          # Main application logic
│   │   └── firebase-config.js # Firebase configuration
│   ├── images/             # Image assets
│   └── index.html          # Main HTML file
├── .gitignore             # Git ignore file
└── README.md              # Project documentation
```

## Firebase Security Rules

Set up the following security rules in your Firestore database:

```
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{postId} {
      // Allow read access to all users
      allow read: if true;
      
      // Allow create, update, delete only to authenticated users
      allow create, update, delete: if request.auth != null && 
        (
          // Allow if user is the original author
          request.resource.data.userId == request.auth.uid ||
          // Or if user has admin role (you'll need to implement this)
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
        );
    }
  }
}
```

## Environment Variables

Create a `.env` file in the root directory with your Firebase configuration:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Available Scripts

- `firebase serve` - Run the app locally
- `firebase deploy` - Deploy the app to Firebase Hosting

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [Google Fonts](https://fonts.google.com/)
