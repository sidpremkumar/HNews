import Bluebird from "bluebird";
import {
  GetCommentResponseRaw,
  GetStoryResponseRaw,
} from "./HackerNewsClient.types";

class HackerNewsClient {
  private baseURL: string;
  constructor() {
    this.baseURL = "https://hacker-news.firebaseio.com/v0/";
  }

  /**
   * Gets top stories
   */
  getTopStories(): Promise<number[]> {
    const url = new URL("topstories.json?print=pretty", this.baseURL).href;
    return fetch(url).then((res) => res.json());
  }

  /**
   * Get data for a story
   */
  async getStoryDetails(
    postId: number
  ): Promise<GetStoryResponseRaw | undefined> {
    const url = new URL(`item/${postId}.json?print=pretty`, this.baseURL).href;
    let attempts = 0;
    let storyInfo: GetStoryResponseRaw;
    try {
      while (attempts < 3) {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error("Fetch failed");
          storyInfo = await response.json();
          return storyInfo;
        } catch (error) {
          attempts++;
          await new Promise((resolve) =>
            setTimeout(resolve, 250 * Math.random())
          );
          if (attempts >= 3) {
            throw new Error(`TOO MANY ATTEMPTS`);
          }
        }
      }
    } catch (err) {
      console.error(`Error getting story info: ${url}`, err);
      return undefined;
    }
  }

  /**
   * Get data for a comment
   */
  async getCommentDetails(commentId: number): Promise<GetCommentResponseRaw> {
    const url = new URL(`item/${commentId}.json?print=pretty`, this.baseURL)
      .href;
    const commentInfo = await fetch(url).then((res) => res.json());
    return commentInfo;
  }

  /**
   * Recursivly gets all comments
   */
  async getAllComments(
    initalCommentIds: number[]
  ): Promise<GetCommentResponseRaw[]> {
    let queue: number[] = [];
    /**
     * Push all current kids on the queue
     */
    queue.push(...initalCommentIds);

    const toReturn: GetCommentResponseRaw[] = [];

    while (queue.length > 0) {
      try {
        const newQueue: number[] = [];

        const commentData = await Bluebird.map(
          queue,
          async (commentId) => {
            try {
              const comment = await this.getCommentDetails(commentId);

              /**
               * Add all comments to the queue
               */
              newQueue.push(...(comment.kids ?? []));

              return comment;
            } catch (err) {
              console.error(`Error getting comments recursibly`, err);
              return undefined;
            }
          },
          { concurrency: 5 }
        );

        const nonUndefined: GetCommentResponseRaw[] = commentData.filter(
          (comment) => comment !== undefined
        ) as GetCommentResponseRaw[];
        toReturn.push(...nonUndefined);
        queue = newQueue;
      } catch (err) {
        console.error(`Bad error getting all comments`, err);
        return toReturn;
      }
    }

    return toReturn;
  }
}

export default new HackerNewsClient();
