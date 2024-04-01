export interface GetStoryResponseRaw {
  id: number;
  by: string;
  descendants: number;
  kids: number[];
  score: number;
  time: number;
  title: string;
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
