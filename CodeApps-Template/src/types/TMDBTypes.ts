export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  popularity: number;
  vote_average: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface PersonMovie {
  id: number;
  title: string;
  poster_path: string | null;
  character?: string;
  release_date?: string;
}

export interface PersonPhoto {
  file_path: string;
  vote_average?: number;
  vote_count?: number;
}

export interface PersonInfo {
  name: string;
  biography?: string;
  birthday?: string;
  place_of_birth?: string;
  profile_path?: string;
}

export interface ConfigData {
  images?: {
    base_url: string;
    secure_base_url: string;
    poster_sizes: string[];
  };
}
