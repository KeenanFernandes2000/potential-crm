import { TwitterApi } from 'twitter-api-v2';

// Create a client with the provided credentials
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY as string,
  appSecret: process.env.TWITTER_API_SECRET as string,
  accessToken: process.env.TWITTER_ACCESS_TOKEN as string,
  accessSecret: process.env.TWITTER_ACCESS_SECRET as string,
});

// Get a read-write client
const rwClient = twitterClient.readWrite;

export interface TwitterUserInfo {
  id: string;
  username: string;
  name: string;
  profileImageUrl: string;
  followersCount: number;
  followingCount: number;
  description: string;
}

export interface TwitterPostInfo {
  id: string;
  text: string;
  createdAt: string;
  metrics?: {
    likeCount: number;
    retweetCount: number;
    replyCount: number;
    quoteCount: number;
  };
}

/**
 * Get account information for the authenticated user
 */
export async function getAccountInfo(): Promise<TwitterUserInfo> {
  try {
    const user = await rwClient.v2.me({
      'user.fields': ['profile_image_url', 'description', 'public_metrics']
    });

    return {
      id: user.data.id,
      username: user.data.username,
      name: user.data.name,
      profileImageUrl: user.data.profile_image_url || '',
      description: user.data.description || '',
      followersCount: user.data.public_metrics?.followers_count || 0,
      followingCount: user.data.public_metrics?.following_count || 0
    };
  } catch (error) {
    console.error('Error fetching Twitter account info:', error);
    throw new Error('Failed to fetch Twitter account information');
  }
}

/**
 * Post a tweet
 */
export async function postTweet(text: string): Promise<TwitterPostInfo> {
  try {
    const tweet = await rwClient.v2.tweet(text);
    
    return {
      id: tweet.data.id,
      text: tweet.data.text,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error posting tweet:', error);
    throw new Error('Failed to post tweet');
  }
}

/**
 * Get recent tweets from the authenticated user
 */
export async function getRecentTweets(count: number = 10): Promise<TwitterPostInfo[]> {
  try {
    const timeline = await rwClient.v2.userTimeline(
      (await rwClient.v2.me()).data.id, 
      { 
        max_results: count,
        'tweet.fields': ['created_at', 'public_metrics']
      }
    );
    
    return timeline.data.data.map(tweet => ({
      id: tweet.id,
      text: tweet.text,
      createdAt: tweet.created_at || new Date().toISOString(),
      metrics: {
        likeCount: tweet.public_metrics?.like_count || 0,
        retweetCount: tweet.public_metrics?.retweet_count || 0,
        replyCount: tweet.public_metrics?.reply_count || 0,
        quoteCount: tweet.public_metrics?.quote_count || 0
      }
    }));
  } catch (error) {
    console.error('Error fetching recent tweets:', error);
    throw new Error('Failed to fetch recent tweets');
  }
}

/**
 * Check if the provided Twitter credentials are valid
 */
export async function verifyCredentials(): Promise<boolean> {
  try {
    await rwClient.v2.me();
    return true;
  } catch (error) {
    console.error('Error verifying Twitter credentials:', error);
    return false;
  }
}

export default {
  getAccountInfo,
  postTweet,
  getRecentTweets,
  verifyCredentials
};