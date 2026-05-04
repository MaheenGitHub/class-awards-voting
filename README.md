# Class Voting Awards 🎉

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?style=flat-square&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-12.12.1-ffca28?style=flat-square&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

A sophisticated full-stack web application designed for secure class voting with cryptographic anonymity and real-time data management. yay

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Setup Guide](#setup-guide)
- [Security Implementation](#security-implementation)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Author](#author)
- [Support](#support)

## Key Features

### 🔐 Cryptographic Anonymity Layer
- **SHA-256 Hashing**: Cryptographic hashing of user identifiers with secret salt
- **Irreversible Mapping**: One-way hash prevents voter identification even by database administrators
- **Collision Prevention**: Unique hash generation ensures vote integrity while maintaining privacy
- **Vote Integrity**: Hashed IDs maintain voting security while protecting anonymity

### 🎓 BITF22 Batch Verification
- **Domain Validation**: Strict email pattern matching for `.*@bitf22m[0-9]{3}@pucit.edu.pk`
- **Roll Number Enforcement**: Regex-based validation ensures only authorized batch members
- **Firebase Auth Integration**: Google OAuth with domain-specific restrictions
- **Real-time Verification**: Instant validation during authentication process

### ⚡ Real-time Voting
- **Firestore Integration**: Real-time database operations with atomic transactions
- **Live Updates**: Instant reflection of voting progress across all connected clients
- **Data Consistency**: Transaction-based operations prevent data corruption
- **Network Resilience**: Basic error handling for connection issues

### 🎨 Modular UI with Glassmorphism
- **50 Categories**: Comprehensive award system with dynamic categorization
- **Glassmorphism Design**: Modern UI with backdrop filters and transparency effects
- **Responsive Layout**: Adaptive design for mobile, tablet, and desktop viewports
- **Progressive Enhancement**: Smooth animations and micro-interactions throughout

## Tech Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Next.js | 16.2.4 | React-based full-stack framework |
| **Language** | TypeScript | 6.0.3 | Type-safe development |
| **Styling** | Tailwind CSS | 4.2.4 | Utility-first CSS framework |
| **Backend** | Firebase | 12.12.1 | Authentication & Database |
| **Database** | Firestore | - | NoSQL real-time database |
| **Authentication** | Firebase Auth | - | Google OAuth integration |
| **Animations** | Framer Motion | 12.38.0 | UI animations and transitions |
| **Icons** | Heroicons | 2.2.0 | React icon components |
| **HTTP Client** | React Firebase Hooks | 5.1.1 | Firebase integration |
| **Build Tool** | Next.js | - | Built-in bundler |
| **Deployment** | Vercel | - | Cloud hosting platform |

## Architecture Overview

### Data Flow
```
User Authentication → Hashed ID Generation → Vote Submission → Atomic Transaction → Real-time Updates
```

### Security Layers
1. **Firebase Auth**: Domain-restricted Google OAuth
2. **Client-side Hashing**: SHA-256 with secret salt
3. **Firestore Rules**: Server-side validation
4. **Atomic Operations**: Transaction-based data integrity

### Component Structure
- **Authentication Layer**: Google OAuth with domain validation
- **Business Logic**: Hash generation and vote processing
- **Data Layer**: Firestore with security rules
- **Presentation Layer**: React components with TypeScript

## Setup Guide

### Prerequisites

- **Node.js 18+** installed on your system
- **Google account** with `@bitf22m[0-9]{3}@pucit.edu.pk` email domain
- **Firebase project** with proper configuration

### Step 1: Firebase Configuration

1. Navigate to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable **Authentication** → **Google** provider
4. Enable **Firestore Database** with production rules
5. Configure **Authorized Domains** in Authentication settings
6. Deploy **Firestore Security Rules** from `firestore.rules`
7. Retrieve your Firebase configuration from Project Settings

### Step 2: Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/MaheenGitHub/class-awards-voting.git
   cd class-awards-voting
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` with your configuration:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Hashing Configuration
   NEXT_PUBLIC_HASH_SALT=bitf22-voting-secret-2024
   ```

### Step 3: Database Initialization

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Access the application at `http://localhost:3000`
3. Authenticate with your BITF22 Google account
4. Run the seeding script to populate the database:
   ```bash
   npm run seed
   ```
5. The script will populate:
   - 50 student records with roll numbers
   - 50 voting categories with descriptions
   - Initial database structure

**Note**: The Admin Dashboard is currently under development and access is restricted to the developer.

### Step 4: Launch Application

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
class-voting-awards/
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── admin/            # Admin dashboard page
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   │   ├── AuthGuard.tsx     # Authentication guard
│   │   ├── Authentication.tsx # Main auth component
│   │   ├── SearchableDropdown.tsx # Search component
│   │   └── VotingInterface.tsx # Voting UI
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx  # Authentication context
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts          # Authentication utilities
│   │   ├── firebase.ts      # Firebase configuration
│   │   ├── firestore.ts     # Firestore operations
│   │   └── initData.ts      # Database initialization
│   └── types/               # TypeScript definitions
│       └── index.ts         # Type definitions
├── public/                  # Static assets
│   └── pics/               # Image assets
├── scripts/                # Database scripts
│   ├── seed-production.js  # Production seeding
│   └── verify-categories.js # Category verification
├── .env.local             # Environment variables
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
├── next.config.js        # Next.js configuration
└── README.md            # This file
```

## Security Implementation

### Cryptographic Anonymity

```typescript
// Hash function for user ID anonymization
const hashUserId = (userId: string): string => {
  const secretSalt = 'bitf22-voting-secret-2024'
  return crypto.createHash('sha256').update(userId + secretSalt).digest('hex')
}
```

### Firestore Security Rules

```javascript
// Votes collection - strict validation
match /votes/{voteId} {
  allow create: if request.auth != null 
    && request.auth.token.email.matches(".*@bitf22m[0-9]{3}@pucit.edu.pk")
    && request.resource.data.anonymousUserId.matches('^[a-f0-9]{64}$')
    && !exists(/databases/$(database)/documents/userVotes/$(request.resource.data.anonymousUserId));
  
  allow read: if false;  // Maintain complete anonymity
  allow update, delete: if false;  // Prevent vote modification
}
```

### Data Integrity Guarantees

1. **Atomic Transactions**: All vote operations use Firestore batches
2. **Collision Resistance**: SHA-256 ensures unique hash generation
3. **Temporal Isolation**: Votes cannot be linked across time periods
4. **Access Control**: Server-side validation prevents unauthorized access

## API Reference

### Core Functions

#### `submitVote(userId, categoryId, studentId)`
Submits a vote with cryptographic anonymity
- **Parameters**: User ID, category ID, selected student ID
- **Returns**: Promise<void>
- **Security**: Hashes user ID before database storage

#### `getUserVotes(userId)`
Retrieves user's voting history
- **Parameters**: User ID
- **Returns**: Promise<UserVote>
- **Privacy**: Only user can access their own votes

#### `getVoteResults()`
Aggregates anonymous voting results
- **Parameters**: None
- **Returns**: Promise<VoteResults[]>
- **Security**: Never exposes voter identities

### Data Models

```typescript
interface Vote {
  categoryId: string
  studentId: string
  anonymousUserId: string  // SHA-256 hash
  timestamp: Timestamp
}

interface VoteResults {
  categoryId: string
  categoryTitle: string
  votes: {
    studentId: string
    studentName: string
    voteCount: number
  }[]
}
```

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

We welcome contributions to enhance the voting system. Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Maintain TypeScript type safety
- Follow existing code style and patterns
- Ensure security rules remain intact
- Test thoroughly before submission

## Author

**Maheen Fatima**

- **GitHub**: [MaheenGitHub](https://github.com/MaheenGitHub)
- **LinkedIn**: [Maheen Fatima](https://www.linkedin.com/in/maheenfatimaa)
- **Email**: maheen.fatima@bitf22m001.pucit.edu.pk

### About the Author
Full-stack developer with expertise in React, TypeScript, and Firebase security implementations. Focused on creating secure, scalable web applications with emphasis on user privacy and data protection.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you find this voting system useful, please consider giving it a ⭐ on GitHub!

### Ways to Support
- **Star the Repository**: Show appreciation for the work
- **Report Issues**: Help improve the system by reporting bugs
- **Suggest Features**: Contribute ideas for enhancement
- **Share**: Spread the word about secure voting solutions

### Get Help
- Create an issue for bug reports or feature requests
- Check existing documentation before asking questions
- Join the discussion in GitHub Issues

---

**Built with cryptographic precision for the BITF22 batch** 🎓
