
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format a date string
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Calculate time remaining
export function getTimeRemaining(expiryDateString: string): string {
  const now = new Date();
  const expiryDate = new Date(expiryDateString);
  const diffMs = expiryDate.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return 'Expired';
  }
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m remaining`;
  } else {
    return `${diffMinutes}m remaining`;
  }
}

// Get abbreviated display name
export function getDisplayName(name: string, maxLength: number = 20): string {
  if (name.length <= maxLength) {
    return name;
  }
  
  const nameParts = name.split(' ');
  if (nameParts.length === 1) {
    return name.substring(0, maxLength) + '...';
  }
  
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];
  
  return `${firstName} ${lastName.charAt(0)}.`;
}
