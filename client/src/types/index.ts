export type Song = {
  id: string;
  name: string;
  artists: string;
  images: string;
  album: string;
  duration: string;
  index: number;
};

export interface downloads {
  title: string;
  downloadPath: string;
  coverPath: string;
  id: string;
  type: "Song" | "Playlist";
  complete: boolean;
}

export interface playlist {
  cover: string;
  name: string;
  owner: string;
  length: number;
  tracks: Song[];
}
