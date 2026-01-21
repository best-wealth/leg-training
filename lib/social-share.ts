import * as Linking from 'expo-linking';
import { Share } from 'react-native';

export interface ShareData {
  title: string;
  message: string;
  url?: string;
}

/**
 * Generate a pre-formatted message for PR achievements
 */
export function generatePRShareMessage(
  exerciseName: string,
  weight: number,
  unit: 'kg' | 'lb',
  improvement?: number
): string {
  const improvementText = improvement 
    ? ` (+${improvement.toFixed(1)}% improvement!)` 
    : '';
  
  return `🏋️ Just crushed a new PR on ${exerciseName}! Lifted ${weight}${unit}${improvementText} 💪 #BasketballTraining #LegDay #PersonalRecord`;
}

/**
 * Generate a pre-formatted message for box jump achievements
 */
export function generateBoxJumpShareMessage(height: number, improvement?: number): string {
  const improvementText = improvement 
    ? ` (+${improvement.toFixed(1)}% improvement!)` 
    : '';
  
  return `🚀 New box jump PR! ${height} inches${improvementText} 📦 Building explosive power for basketball! #VerticalJump #Plyometrics #BasketballTraining`;
}

/**
 * Generate a pre-formatted message for badge achievements
 */
export function generateBadgeShareMessage(badgeName: string, badgeDescription: string): string {
  return `🏆 Just unlocked the "${badgeName}" achievement! ${badgeDescription} 🎯 #BasketballTraining #FitnessGoals #Achievement`;
}

/**
 * Generate a pre-formatted message for workout session completion
 */
export function generateSessionShareMessage(sessionNumber: number, totalSessions: number): string {
  const milestone = totalSessions === 10 ? ' 🎉 10 sessions!' 
    : totalSessions === 25 ? ' 🎉 25 sessions!'
    : totalSessions === 50 ? ' 🎉 50 sessions!'
    : totalSessions === 100 ? ' 🎉 100 sessions!'
    : '';
  
  return `💪 Completed session #${sessionNumber}!${milestone} Staying consistent with my basketball leg and hip training! #BasketballTraining #FitnessMilestone`;
}

/**
 * Share to Twitter/X
 */
export async function shareToTwitter(message: string): Promise<void> {
  try {
    const encodedMessage = encodeURIComponent(message);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}`;
    await Linking.openURL(twitterUrl);
  } catch (error) {
    console.error('Error sharing to Twitter:', error);
    throw error;
  }
}

/**
 * Share to Facebook
 */
export async function shareToFacebook(message: string, url?: string): Promise<void> {
  try {
    const encodedMessage = encodeURIComponent(message);
    const facebookUrl = url 
      ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodedMessage}`
      : `https://www.facebook.com/sharer/sharer.php?quote=${encodedMessage}`;
    
    await Linking.openURL(facebookUrl);
  } catch (error) {
    console.error('Error sharing to Facebook:', error);
    throw error;
  }
}

/**
 * Share to Instagram (copy to clipboard since Instagram doesn't have direct sharing)
 */
export async function shareToInstagram(message: string): Promise<void> {
  try {
    // Instagram doesn't support direct sharing via URL scheme, so we use native Share
    await Share.share({
      message: message,
      title: 'Basketball Training Achievement',
    });
  } catch (error) {
    console.error('Error sharing to Instagram:', error);
    throw error;
  }
}

/**
 * Generic native share using platform's share sheet
 */
export async function shareNatively(data: ShareData): Promise<void> {
  try {
    await Share.share({
      message: data.message,
      title: data.title,
      url: data.url,
    });
  } catch (error) {
    console.error('Error sharing:', error);
    throw error;
  }
}

/**
 * Create a shareable link (can be customized based on your backend)
 */
export function generateShareableLink(type: 'pr' | 'badge' | 'session', id: string): string {
  const baseUrl = 'https://hooplegstraining.app';
  return `${baseUrl}/share/${type}/${id}`;
}
