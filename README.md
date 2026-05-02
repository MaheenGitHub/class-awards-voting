# Class Voting Awards 🎉

A full-stack web application that allows a class of around 50 students to vote for fun award titles while maintaining complete anonymity.

## Features

- 🔐 **Secure Authentication**: Google OAuth restricted to `bitf22m0--.pucit.edu.pk` domain
- 🎭 **Anonymous Voting**: Complete vote anonymity with one-vote-per-user enforcement
- 📱 **Modern UI**: Beautiful, responsive design with pastel colors and smooth animations
- 📊 **Admin Dashboard**: View voting results and export data (JSON/CSV)
- 🎊 **Fun Experience**: Confetti animations, progress tracking, and engaging UI
- 📱 **Mobile Responsive**: Optimized for mobile and desktop viewing

## Tech Stack

- **Frontend**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS with custom pastel theme
- **Backend**: Firebase (Authentication + Firestore)
- **Deployment**: Vercel (recommended)
- **Icons**: Heroicons
- **Animations**: Canvas Confetti

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Google account with `@bitf22m0--.pucit.edu.pk` email
- Firebase project setup

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → **Google** provider
4. Enable **Firestore Database** in test mode
5. In Authentication settings, add authorized domain: `bitf22m0--.pucit.edu.pk`
6. Get your Firebase configuration from Project Settings

### 2. Environment Setup

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd class-voting-awards
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Admin Configuration
   NEXT_PUBLIC_ADMIN_EMAIL=admin@bitf22m0--.pucit.edu.pk
   NEXT_PUBLIC_HASH_SALT=your-unique-salt-here
   ```

### 3. Initialize Database

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:3000` in your browser
3. Sign in with your Google account
4. Go to `http://localhost:3000/admin` (only works with admin email)
5. The database will be automatically populated with:
   - 50 sample students
   - 40 award categories

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
class-voting-awards/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── admin/             # Admin dashboard page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── AuthGuard.tsx      # Authentication guard
│   │   ├── Authentication.tsx # Main auth component
│   │   └── VotingInterface.tsx # Voting UI
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx   # Authentication context
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts           # Authentication utilities
│   │   ├── firebase.ts       # Firebase configuration
│   │   ├── firestore.ts      # Firestore operations
│   │   └── initData.ts       # Database initialization
│   └── types/                # TypeScript definitions
│       └── index.ts          # Type definitions
├── public/                   # Static assets
├── .env.local               # Environment variables
├── package.json            # Dependencies
├── tailwind.config.js      # Tailwind configuration
└── README.md              # This file
```

## Key Features Explained

### Authentication & Anonymity

- **Domain Restriction**: Only `@bitf22m0--.pucit.edu.pk` emails can sign in
- **Anonymous Voting**: User emails are hashed and never stored in plain text
- **One Vote Per User**: Hashed user IDs prevent duplicate voting
- **Admin Access**: Separate admin dashboard with email-based access control

### Voting System

- **40+ Categories**: Fun award titles with emojis and descriptions
- **Student Selection**: Dropdown with 50+ student names
- **Progress Tracking**: Visual progress bar showing completion status
- **Vote Validation**: Ensures all categories are voted for before submission

### User Experience

- **Modern UI**: Pastel colors, rounded corners, smooth animations
- **Mobile Responsive**: Works perfectly on phones and tablets
- **Trust Message**: Clear communication about anonymity
- **Confetti Animation**: Celebratory animation on successful submission
- **Loading States**: Smooth loading indicators throughout

### Admin Dashboard

- **Real-time Results**: Live voting statistics and leaderboards
- **Export Options**: Download results as JSON or CSV
- **Category Breakdown**: Detailed results per award category
- **Statistics**: Total votes, estimated voters, and participation metrics

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your GitHub account to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | ✅ |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | ✅ |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | ✅ |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | ✅ |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID | Firebase messaging sender ID | ✅ |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | ✅ |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Admin email address | ✅ |
| `NEXT_PUBLIC_HASH_SALT` | Salt for hashing user IDs | ✅ |

## Security Features

- **Domain Restriction**: Only authorized email domains can access
- **Anonymous Hashing**: User emails are never stored in plain text
- **One Vote Per User**: Prevents duplicate voting through hashed IDs
- **Admin Protection**: Admin routes protected by email verification
- **Firebase Security**: Leverages Firebase's built-in security features

## Customization

### Adding New Categories

Edit `src/lib/initData.ts` to add or modify award categories:

```typescript
const categories: Omit<Category, 'id'>[] = [
  { title: 'Your New Category', description: 'Description here', emoji: '🎯' },
  // ... other categories
]
```

### Modifying Students

Update the student list in `src/lib/initData.ts`:

```typescript
const students: Omit<Student, 'id'>[] = [
  { name: 'Student Name', rollNumber: 'BITF22MXXX' },
  // ... other students
]
```

### Customizing Colors

Update `tailwind.config.js` to modify the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      pastel: {
        pink: '#your-color',
        // ... other colors
      }
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Authentication Not Working**
   - Check Firebase configuration in `.env.local`
   - Verify domain restriction settings in Firebase Console
   - Ensure Google provider is enabled

2. **Database Not Populating**
   - Check Firestore rules (set to test mode initially)
   - Verify Firebase project configuration
   - Check browser console for errors

3. **Admin Access Not Working**
   - Verify `NEXT_PUBLIC_ADMIN_EMAIL` is set correctly
   - Ensure you're signed in with the admin email
   - Check browser console for authentication errors

4. **Styling Issues**
   - Run `npm install` to ensure all dependencies are installed
   - Check Tailwind CSS configuration
   - Verify CSS imports in `globals.css`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please create an issue in the repository or contact the development team.

---

**Built with ❤️ for the BITF22M0 class**
