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

export interface AlgoliaCommentRaw {
  author: string;
  children: AlgoliaCommentRaw[];
  created_at: string;
  created_at_i: number;
  id: number;
  options: any[];
  parent_id: number;
  points: number;
  story_id: number;
  text: string;
  title?: string;
  type: string;
  url?: string;
}
export interface AlgoliaGetPostRaw {
  id: number;
  created_at: string;
  author: string;
  title: string;
  url: string;
  text: string;
  points: number;
  parent_id: number | null;
  children: AlgoliaCommentRaw[];
}
