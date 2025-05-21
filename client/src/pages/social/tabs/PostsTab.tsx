import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Send, Loader2, Twitter } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";

type Tweet = {
  id: string;
  text: string;
  createdAt: string;
  metrics?: {
    likeCount: number;
    retweetCount: number;
    replyCount: number;
    quoteCount: number;
  };
};

export default function PostsTab() {
  const [tweetText, setTweetText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  
  // Fetch recent tweets
  const {
    data: tweets,
    isLoading,
    error,
    refetch
  } = useQuery<Tweet[]>({
    queryKey: ['/api/twitter/tweets'],
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const handlePostTweet = async () => {
    if (!tweetText.trim()) return;
    
    try {
      setIsPosting(true);
      
      const response = await fetch('/api/twitter/tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: tweetText }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to post tweet');
      }
      
      // Clear the textarea and refetch tweets
      setTweetText("");
      refetch();
      
    } catch (error) {
      console.error('Error posting tweet:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading tweets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading tweets</AlertTitle>
          <AlertDescription>
            There was an error loading tweets. Please verify your Twitter API credentials.
          </AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create a new Tweet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="What's happening?"
              className="min-h-[100px]"
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              maxLength={280}
            />
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {tweetText.length}/280 characters
              </div>
              <Button 
                onClick={handlePostTweet} 
                disabled={!tweetText.trim() || isPosting}
                className="flex items-center gap-2"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Tweet
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h3 className="text-xl font-medium">Recent Tweets</h3>
        
        {tweets && tweets.length > 0 ? (
          tweets.map((tweet) => (
            <Card key={tweet.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Twitter className="h-5 w-5 text-blue-400" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="font-medium">
                        Tweet
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(tweet.createdAt)}
                      </div>
                    </div>
                    <p className="my-2">{tweet.text}</p>
                    {tweet.metrics && (
                      <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                        <span>{tweet.metrics.likeCount} likes</span>
                        <span>{tweet.metrics.retweetCount} retweets</span>
                        <span>{tweet.metrics.replyCount} replies</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground">No tweets found. Create your first tweet above!</p>
        )}
      </div>
    </div>
  );
}