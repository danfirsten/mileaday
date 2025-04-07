export const AVATAR_OPTIONS = [
  {
    id: 'default',
    url: '/avatars/default.png',
    label: 'Default'
  },
  {
    id: 'runner1',
    url: '/avatars/runner1.png',
    label: 'Runner 1'
  },
  {
    id: 'runner2',
    url: '/avatars/runner2.png',
    label: 'Runner 2'
  },
  {
    id: 'runner3',
    url: '/avatars/runner3.png',
    label: 'Runner 3'
  },
  {
    id: 'runner4',
    url: '/avatars/runner4.png',
    label: 'Runner 4'
  }
] as const;

// Helper function to get avatar URL by ID
export function getAvatarUrl(id: string): string {
  const avatar = AVATAR_OPTIONS.find(avatar => avatar.id === id);
  return avatar?.url || AVATAR_OPTIONS[0].url;
} 