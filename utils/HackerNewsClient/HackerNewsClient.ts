import * as Keychain from "react-native-keychain";
import CookieManager from "@react-native-cookies/cookies";
import Bluebird from "bluebird";
import {
  AlgoliaGetPostRaw,
  GetCommentResponseRaw,
  GetStoryResponseRaw,
  GetUserResponseRaw,
} from "./HackerNewsClient.types";
import { parse } from "node-html-parser";

class HackerNewsClient {
  private baseURL: string;
  constructor() {
    this.baseURL = "https://hacker-news.firebaseio.com/v0/";
  }

  /**
   * Gets top stories
   */
  async getTopStories(): Promise<number[]> {
    const url = new URL("topstories.json?print=pretty", this.baseURL).href;
    const res = await fetch(url);
    return await res.json();
  }

  /**
   * Get new stories
   */
  async getNewStories(): Promise<number[]> {
    const url = new URL("newstories.json?print=pretty", this.baseURL).href;
    const res = await fetch(url);
    return await res.json();
  }

  /**
   * Get best stories
   */
  async getBestStories(): Promise<number[]> {
    const url = new URL("beststories.json?print=pretty", this.baseURL).href;
    const res = await fetch(url);
    return await res.json();
  }

  /**
   * Get all Ask HN stories
   */
  async getAskHNStories(): Promise<number[]> {
    const url = new URL("askstories.json?print=pretty", this.baseURL).href;
    const res = await fetch(url);
    return await res.json();
  }

  /**
   * Get all Show HN stories
   */
  async getShowHNStories(): Promise<number[]> {
    const url = new URL("showstories.json?print=pretty", this.baseURL).href;
    const res = await fetch(url);
    return await res.json();
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
   * Use Algolia to get all data for a post
   */
  async getAllData(postId: number) {
    const result = await fetch(`https://hn.algolia.com/api/v1/items/${postId}`);
    return result.json() as unknown as AlgoliaGetPostRaw;
  }

  /**
   * Get info from a userId
   */
  async getUserInfo(userId: string): Promise<GetUserResponseRaw> {
    const url = new URL(`user/${userId}.json?print=pretty`, this.baseURL).href;
    const userInfo = await fetch(url).then((res) => res.json());
    return userInfo;
  }

  private getLoginURL() {
    const url = new URL(`login`, "https://news.ycombinator.com/").href;
    return url;
  }
  /**
   * Hit the login endpoint and save cookies if we can
   */
  async loginWithCredentials(username: string, password: string) {
    /**
     * First clear out any cookies that might exists
     */
    await CookieManager.clearAll();

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Access-Control-Allow-Origin": "*",
    };

    const url = this.getLoginURL();
    const result = await fetch(url, {
      method: "POST",
      body: new URLSearchParams({
        acct: username,
        pw: password,
        goto: "news",
      }).toString(),
      credentials: "include",
      headers: headers,
    });

    if (result.status !== 200) {
      return false;
    }

    /**
     * Make sure a cookies get saved
     */
    const cookies = await CookieManager.get(url);
    if (!cookies.user || !cookies.user.value) {
      return false;
    }

    return true;
  }

  /**
   * Logout a user
   */
  async logout() {
    await Promise.all([
      Keychain.resetGenericPassword(),
      CookieManager.clearAll(),
    ]);
  }

  /**
   * Check if a user is logged in
   */
  async isLoggedIn() {
    /**
     * Check if we have auth info set
     */
    const credentials = await Keychain.getGenericPassword();
    if (credentials) {
      return credentials;
    }
    return false;
  }

  /**
   * Attempt to login with a username and passowrd. Return T/F if these are
   * valid credentials
   * @note This function will attempt to save username/password to storage
   */
  async validateAndSaveCredentials(
    username: string,
    password: string
  ): Promise<boolean> {
    /**
     * Validate credentials
     */
    const validCredentials = await this.loginWithCredentials(
      username,
      password
    );
    if (!validCredentials) return false;

    /**
     * Nice its 200, lets save these creds
     */
    await Keychain.setGenericPassword(username, password);

    return true;
  }

  /**
   * Get the URL needed to upvote from a parsed HTML
   */
  async getUpvoteUrl(
    itemId: string,
    parsedHTML: Awaited<ReturnType<typeof this.getParsedHTML>>
  ) {
    const foundElement = parsedHTML.querySelector(`#up_${itemId}`);
    if (foundElement === null) return undefined;
    if (foundElement.getAttribute("class")?.includes("nosee")) {
      return undefined;
    }

    return `https://news.ycombinator.com/${foundElement.getAttribute("href")}`;
  }

  /**
   * Get the URL needed to upvote from a parsed html
   */
  async getDownvoteUrl(
    itemId: string,
    parsedHTML: Awaited<ReturnType<typeof this.getParsedHTML>>
  ) {
    const foundElement = parsedHTML.querySelector(`#un_${itemId}`);
    if (foundElement === null) return undefined;
    if (foundElement.getAttribute("class")?.includes("nosee")) {
      return undefined;
    }

    return `https://news.ycombinator.com/${foundElement.getAttribute("href")}`;
  }

  /**
   * Get a parsed html of a post
   */
  async getParsedHTML(postId: number) {
    const url = new URL(`item?id=${postId}`, "https://news.ycombinator.com")
      .href;
    return fetch(url, {
      mode: "no-cors",
      credentials: "include",
    })
      .then((response) => response.text())
      .then((responseText) => {
        const parsedHTML = parse(responseText, { parseNoneClosedTags: true });
        return parsedHTML;
      });
  }

  /**
   * Given a URL, make a request.
   * @see getUpvoteUrl
   */
  async makeAuthRequest(url: string) {
    const response = await fetch(url, {
      credentials: "include",
    });
    if (response.status === 200) return true;
    return false;
  }

  /**
   * Write a new comment
   */
  async writeComment(postId: number, commentBody) {
    /**
     * First extract the hmac from the input
     */
    const url = new URL(`item?id=${postId}`, "https://news.ycombinator.com")
      .href;
    const response = await fetch(url, {
      mode: "no-cors",
      credentials: "include",
    });
    const responseText = await response.text();
    const parsedHTML = parse(responseText, { parseNoneClosedTags: true });

    /**
     * Now with the parsed html, extract the hmac
     */
    const extractedHMAC = parsedHTML
      .querySelector("input[name='hmac']")
      ?.getAttribute("value");

    if (!extractedHMAC) return false;

    /**
     * Now we can make our HTTP request
     */
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Access-Control-Allow-Origin": "*",
    };

    const commentURL = new URL("comment", "https://news.ycombinator.com").href;
    const result = await fetch(commentURL, {
      method: "POST",
      body: new URLSearchParams({
        parent: postId.toString(),
        goto: `item?id=${postId}`,
        hmac: extractedHMAC,
        text: commentBody,
      }).toString(),
      credentials: "include",
      headers: headers,
    });

    if (result.status !== 200) return false;

    return true;
  }
}

export default new HackerNewsClient();
