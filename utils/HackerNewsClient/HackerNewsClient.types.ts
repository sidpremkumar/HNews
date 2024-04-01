export interface GetStoryResponseRaw {
  id: number;
  by: string;
  descendants: number;
  kids: number[];
  score: number;
  time: number;
  title: string;
  text?: string;
  type: string;
  url: string;
}

export interface GetCommentResponseRaw {
  id: number;
  by: string;
  kids: number[];
  parent: number;
  text: string;
  time: number;
  type: string;
}

export interface GetUserResponseRaw {
  id: string;
  created: number;
  karma: number;
  /**
   * The user's optional self-description. HTML.
   */
  about: string;
  /**
   * List of the user's stories, polls and comments.
   */
  submitted: number[];
}
