# Mile A Day

I made a New Years Resolution with my friends to run 365 miles in 2025. I wanted to make a web application that helps us track our daily running goals, encouraging us to run at least one mile every day.

Built with Next.js 14, TypeScript, and Supabase.

## Features

- **User Authentication**: Secure login and registration system powered by Supabase Auth
- **Daily Run Tracking**: Log your daily runs with distance and optional notes
- **Progress Dashboard**: Visual representation of your running progress and statistics
- **Profile Management**: Customize your profile with predefined avatars
- **Community Features**: Share your running achievements and interact with other runners
- **Leaderboard**: Compare your progress with other users
- **Streak Tracking**: Monitor your daily running streak and longest streak
- **Achievement System**: Earn achievements for reaching milestones

## Tech Stack

- **Frontend**:
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - shadcn/ui Components
  - React Hook Form

- **Backend**:
  - Supabase (Database & Authentication)
  - PostgreSQL
  - Row Level Security (RLS)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mileaday.git
cd mileaday
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

The application requires the following Supabase tables:

- `users`: User profiles and settings
- `runs`: Daily run records
- `posts`: Community posts and updates

Refer to the migration files in the `supabase/migrations` directory for the complete schema.

## Project Structure

```
mileaday/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── dashboard/         # Protected dashboard routes
├── components/            # React components
├── lib/                   # Utility functions and types
├── public/               # Static assets
│   └── avatars/          # User avatar images
└── supabase/             # Supabase configuration and migrations
```

## Features in Detail

### Authentication
- Email/password authentication
- Protected routes
- Session management

### Dashboard
- Daily run logging
- Progress visualization
- Statistics tracking
- Achievement badges

### Profile Management
- Custom avatar selection
- Name and email updates
- Password management
- Account deletion

### Community
- Share running achievements
- View other runners' progress
- Leaderboard rankings
- Streak comparisons

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/) 