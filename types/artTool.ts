export type Feedback = {
  rating: number;
  comment: string;
  author: string;
  date: string;
};

export type ArtTool = {
  id: string;
  artName: string;
  price: number;
  description: string;
  image: string;
  brand: string;
  limitedTimeDeal?: number;
  glassSurface?: boolean;
  feedbacks?: Feedback[];
  minutes?: number;
  position?: string;
  passingAccuracy?: number;
  gender?: string;
};
