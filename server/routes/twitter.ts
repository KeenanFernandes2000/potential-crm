import express, { Request, Response } from 'express';
import twitterService from '../services/twitterService';

const router = express.Router();

// Get Twitter account info
router.get('/account', async (req: Request, res: Response) => {
  try {
    const accountInfo = await twitterService.getAccountInfo();
    res.json(accountInfo);
  } catch (error) {
    console.error('Error in Twitter account route:', error);
    res.status(500).json({ error: 'Failed to fetch Twitter account information' });
  }
});

// Verify Twitter credentials
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const isValid = await twitterService.verifyCredentials();
    res.json({ valid: isValid });
  } catch (error) {
    console.error('Error in Twitter verify route:', error);
    res.status(500).json({ error: 'Failed to verify Twitter credentials' });
  }
});

// Get recent tweets
router.get('/tweets', async (req: Request, res: Response) => {
  try {
    const count = req.query.count ? parseInt(req.query.count as string) : 10;
    const tweets = await twitterService.getRecentTweets(count);
    res.json(tweets);
  } catch (error) {
    console.error('Error in Twitter tweets route:', error);
    res.status(500).json({ error: 'Failed to fetch recent tweets' });
  }
});

// Post a new tweet
router.post('/tweet', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Tweet text is required' });
    }
    
    const tweet = await twitterService.postTweet(text);
    res.status(201).json(tweet);
  } catch (error) {
    console.error('Error in Twitter post tweet route:', error);
    res.status(500).json({ error: 'Failed to post tweet' });
  }
});

export default router;