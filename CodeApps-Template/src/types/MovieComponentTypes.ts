import type { CastMember, Video, PersonMovie, PersonPhoto, PersonInfo } from './TMDBTypes'

export interface MovieDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  movie: {
    id: number
    title: string
    poster_path: string | null
    overview: string
    release_date: string
    vote_average: number
    popularity: number
  } | null
  cast: CastMember[]
  videos: Video[]
  loading: boolean
  imageBaseUrl: string | null
  onCastMemberClick?: (personId: number, personName: string) => void
}

export interface PersonMoviesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  personName: string | null
  personInfo?: PersonInfo | null
  movies: PersonMovie[]
  photos?: PersonPhoto[]
  loading: boolean
  imageBaseUrl: string | null
  onMovieClick?: (movieId: number) => void
}
