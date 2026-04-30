import { Text, Card, makeStyles, shorthands, tokens, Button, Badge, Spinner, Input, Dropdown, Option, Field } from '@fluentui/react-components';
import { SearchRegular } from '@fluentui/react-icons';
import { useState, useEffect } from 'react';
import { TMDBService } from '../generated/services/TMDBService';
import { useTheme } from '../hooks/useTheme';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
  release_date: string;
  popularity: number;
  vote_average: number;
}

interface ConfigData {
  images?: {
    base_url: string;
    secure_base_url: string;
    poster_sizes: string[];
  };
}

type SortOption = 'popularity' | 'release_date' | 'title_asc' | 'title_desc';

const useStyles = makeStyles({
  container: {
    maxWidth: '1400px',
    ...shorthands.margin('0', 'auto'),
    ...shorthands.padding('0', '24px'),
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: '16px',
  },
  controls: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    ...shorthands.gap('16px'),
    marginBottom: '24px',
    ...shorthands.padding('16px'),
    borderRadius: tokens.borderRadiusMedium,
  },
  moviesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    ...shorthands.gap('24px'),
  },
  movieCard: {
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: `0 8px 24px ${tokens.colorNeutralShadowAmbient}`,
      ...shorthands.border('1px', 'solid', tokens.colorBrandStroke1),
    },
  },
  posterContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: `${tokens.borderRadiusMedium} ${tokens.borderRadiusMedium} 0 0`,
    height: '300px',
    backgroundColor: tokens.colorNeutralBackground2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  posterPlaceholder: {
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground3,
    textAlign: 'center',
  },
  movieContent: {
    ...shorthands.padding('12px'),
  },
  movieTitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: '8px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  movieMeta: {
    fontSize: tokens.fontSizeBase200,
    marginBottom: '4px',
  },
  rating: {
    display: 'inline-block',
    ...shorthands.padding('2px', '8px'),
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    marginTop: '8px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.padding('64px', '24px'),
  },
  errorContainer: {
    ...shorthands.padding('24px'),
    borderRadius: tokens.borderRadiusMedium,
    border: `2px solid ${tokens.colorPaletteRedBorder2}`,
  },
  emptyContainer: {
    ...shorthands.padding('64px', '24px'),
    textAlign: 'center',
    borderRadius: tokens.borderRadiusMedium,
  },
  mockDataBadge: {
    marginBottom: '16px',
  },
  noResultsText: {
    fontSize: tokens.fontSizeBase300,
  },
  pageHeader: {
    marginBottom: '24px',
  },
  headerTitle: {
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightBold,
    marginBottom: '8px',
  },
  headerSubtitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightRegular,
  },
});

export function TMDB() {
  const styles = useStyles();
  const { isDarkMode } = useTheme();
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [sortLabel, setSortLabel] = useState('Popularity');
  const [config, setConfig] = useState<ConfigData | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Get API key from environment or use a placeholder
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY || '586539aaebec57e1a339711bec5d2ae3';

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (configLoaded) {
      loadTrendingMovies();
    }
  }, [configLoaded]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        searchMovies();
      }, 500);
      return () => clearTimeout(debounceTimer);
    } else {
      filterAndSortMovies();
    }
  }, [searchQuery, sortBy]);

  useEffect(() => {
    filterAndSortMovies();
  }, [movies]);

  const loadConfig = async () => {
    try {
      setError(null);
      const result = await TMDBService.GetConfig(API_KEY);
      
      if (result.success && result.data) {
        const configData = result.data as unknown as ConfigData;
        setConfig(configData);
      }
      setConfigLoaded(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load configuration';
      console.error('Config Error:', errorMessage);
      setError(errorMessage);
      setConfigLoaded(true);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await TMDBService.GetTrending('week', API_KEY);

      if (result.success && result.data) {
        const data = result.data as unknown as { results: Movie[] };
        setMovies(data.results || []);
      } else {
        setError('Failed to load trending movies');
        setMovies([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading movies';
      console.error('Trending Movies Error:', errorMessage);
      setError(errorMessage);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await TMDBService.MovieQuery(API_KEY, searchQuery.trim());

      if (result.success && result.data) {
        const data = result.data as unknown as { results: Movie[] };
        setFilteredMovies((data.results || []).sort((a, b) => {
          switch (sortBy) {
            case 'popularity':
              return b.popularity - a.popularity;
            case 'release_date':
              return new Date(b.release_date || '').getTime() - new Date(a.release_date || '').getTime();
            case 'title_asc':
              return a.title.localeCompare(b.title);
            case 'title_desc':
              return b.title.localeCompare(a.title);
            default:
              return 0;
          }
        }));
      } else {
        setError('No results found');
        setFilteredMovies([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while searching movies';
      console.error('Search Error:', errorMessage);
      setError(errorMessage);
      setFilteredMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortMovies = () => {
    let filtered = [...movies];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(query) ||
        movie.overview.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'popularity':
        filtered.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'release_date':
        filtered.sort((a, b) => {
          const dateA = new Date(a.release_date || '').getTime();
          const dateB = new Date(b.release_date || '').getTime();
          return dateB - dateA;
        });
        break;
      case 'title_asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    setFilteredMovies(filtered);
  };

  const getImageUrl = (posterPath: string | null): string | null => {
    if (!posterPath || !config?.images) {
      return null;
    }
    const baseUrl = config.images.secure_base_url || 'https://image.tmdb.org/t/p/';
    const size = config.images.poster_sizes?.[3] || 'w500';
    return `${baseUrl}${size}${posterPath}`;
  };

  const formatDateUS = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const controlsStyle = {
    backgroundColor: isDarkMode ? tokens.colorNeutralBackground2 : tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground1,
  };

  const sectionTitleStyle = {
    color: tokens.colorNeutralForeground1,
  };

  const emptyContainerStyle = {
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorNeutralForeground2,
  };

  const errorContainerStyle = {
    backgroundColor: tokens.colorNeutralBackground2,
    color: tokens.colorPaletteRedForeground2,
  };

  const movieMetaStyle = {
    color: tokens.colorNeutralForeground2,
  };

  const movieTitleStyle = {
    color: tokens.colorNeutralForeground1,
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div className={styles.headerTitle} style={{ color: tokens.colorNeutralForeground1 }}>
          🎬 Movie Database
        </div>
        <div className={styles.headerSubtitle} style={{ color: tokens.colorNeutralForeground2 }}>
          Discover trending movies and explore through The Movie Database API
        </div>
      </div>

      <Badge className={styles.mockDataBadge} appearance="tint" color="informative">
        ℹ️ Powered by The Movie Database (TMDB)
      </Badge>

      {/* Search and Sort Controls */}
      {!loading && !error && (
        <section className={styles.section}>
          <div className={styles.controls} style={controlsStyle}>
            <Field label="Search Movies">
              <Input
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(_, data) => setSearchQuery(data.value)}
                contentBefore={<SearchRegular />}
              />
            </Field>

            <Field label="Sort By">
              <Dropdown
                value={sortLabel}
                onOptionSelect={(_, data) => {
                  setSortLabel(data.optionText as string);
                  setSortBy(data.optionValue as SortOption);
                }}
              >
                <Option value="popularity">Popularity</Option>
                <Option value="release_date">Release Date</Option>
                <Option value="title_asc">Title (A-Z)</Option>
                <Option value="title_desc">Title (Z-A)</Option>
              </Dropdown>
            </Field>
          </div>
        </section>
      )}

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingContainer}>
          <Spinner size="large" label="Loading trending movies..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <section className={styles.section}>
          <Card className={styles.errorContainer} style={errorContainerStyle}>
            <Text style={{ marginBottom: '12px' }}>
              ❌ {error}
            </Text>
            <Text className={styles.noResultsText}>
              Make sure your TMDB API key is configured. Set VITE_TMDB_API_KEY environment variable.
            </Text>
            <Button
              onClick={loadTrendingMovies}
              style={{ marginTop: '12px' }}
              appearance="outline"
            >
              Retry
            </Button>
          </Card>
        </section>
      )}

      {/* Movies Grid */}
      {!loading && !error && filteredMovies.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle} style={sectionTitleStyle}>
            🎬 Movies ({filteredMovies.length})
          </h3>
          <div className={styles.moviesGrid}>
            {filteredMovies.map((movie) => (
              <Card key={movie.id} className={styles.movieCard}>
                <div className={styles.posterContainer}>
                  {getImageUrl(movie.poster_path) ? (
                    <img
                      src={getImageUrl(movie.poster_path) || ''}
                      alt={movie.title}
                      className={styles.posterImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className={styles.posterPlaceholder}>
                      📽️ No Image
                    </div>
                  )}
                </div>
                <div className={styles.movieContent}>
                  <div className={styles.movieTitle} style={movieTitleStyle}>
                    {movie.title}
                  </div>
                  <div className={styles.movieMeta} style={movieMetaStyle}>
                    📅 {formatDateUS(movie.release_date)}
                  </div>
                  <div className={styles.movieMeta} style={movieMetaStyle}>
                    🔥 Popularity: {movie.popularity.toFixed(1)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* No Results State */}
      {!loading && !error && movies.length > 0 && filteredMovies.length === 0 && (
        <section className={styles.section}>
          <Card className={styles.emptyContainer} style={emptyContainerStyle}>
            <Text className={styles.noResultsText}>
              No movies found matching "{searchQuery}". Try a different search term.
            </Text>
          </Card>
        </section>
      )}

      {/* Empty State */}
      {!loading && !error && movies.length === 0 && (
        <section className={styles.section}>
          <Card className={styles.emptyContainer} style={emptyContainerStyle}>
            <Text className={styles.noResultsText}>
              No trending movies available. Try refreshing the data.
            </Text>
            <Button
              onClick={loadTrendingMovies}
              appearance="primary"
              style={{ marginTop: '16px' }}
            >
              Load Trending Movies
            </Button>
          </Card>
        </section>
      )}
    </div>
  );
}
