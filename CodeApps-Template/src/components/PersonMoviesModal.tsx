import { Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, Button, makeStyles, shorthands, tokens, Spinner } from '@fluentui/react-components';
import { ChevronDownRegular, ChevronLeftRegular, ChevronRightRegular } from '@fluentui/react-icons';
import { useState, useEffect } from 'react';
import type { PersonMovie, PersonPhoto, PersonInfo } from '../types/TMDBTypes';
import type { PersonMoviesModalProps } from '../types/MovieComponentTypes';

const useStyles = makeStyles({
  dialogSurface: {
    maxWidth: '1200px',
    width: '90vw',
  },
  dialogContent: {
    maxWidth: '90vw',
    width: '100%',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.padding('40px', '0'),
  },
  personInfoSection: {
    display: 'grid',
    gridTemplateColumns: '150px 1fr',
    ...shorthands.gap('24px'),
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  personHeadshot: {
    width: '150px',
    height: 'auto',
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow16,
  },
  personHeadshotPlaceholder: {
    width: '150px',
    height: '225px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: tokens.fontSizeBase400,
    color: tokens.colorNeutralForeground3,
  },
  personBioDetails: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
  },
  personDetailRow: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('4px'),
  },
  personDetailLabel: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
  },
  personDetailValue: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground1,
  },
  biography: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.6',
    marginTop: '8px',
  },
  creditsHeaderButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '8px 0',
    border: 'none',
    background: 'none',
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    transition: 'color 0.2s ease',
    '&:hover': {
      color: tokens.colorBrandForeground1,
    },
  },
  chevronIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease',
  },
  chevronExpanded: {
    transform: 'rotate(180deg)',
  },
  personMoviesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    ...shorthands.gap('16px'),
    marginBottom: '16px',
  },
  personMovieCard: {
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'translateY(-4px)',
    },
  },
  personMoviePoster: {
    width: '100%',
    aspectRatio: '2/3',
    borderRadius: tokens.borderRadiusMedium,
    objectFit: 'cover',
    backgroundColor: tokens.colorNeutralBackground2,
    marginBottom: '8px',
  },
  personMoviePosterPlaceholder: {
    width: '100%',
    aspectRatio: '2/3',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase300,
  },
  personMovieTitle: {
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  personMovieCharacter: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    marginBottom: '4px',
  },
  personMovieRelease: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
  noMovies: {
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    ...shorthands.padding('40px'),
  },
  photosHeaderButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '8px 0',
    border: 'none',
    background: 'none',
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    transition: 'color 0.2s ease',
    marginTop: '32px',
    '&:hover': {
      color: tokens.colorBrandForeground1,
    },
  },
  carouselContainer: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('12px'),
    marginTop: '16px',
  },
  carouselButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground2,
    },
    '&:disabled': {
      opacity: '0.5',
      cursor: 'not-allowed',
    },
  },
  carouselContent: {
    flex: '1',
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    maxHeight: '500px',
    borderRadius: tokens.borderRadiusMedium,
    objectFit: 'contain',
  },
  carouselCounter: {
    textAlign: 'center',
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    marginTop: '8px',
  },
  thumbnailStrip: {
    display: 'flex',
    ...shorthands.gap('8px'),
    marginTop: '16px',
    overflowX: 'auto',
    paddingBottom: '8px',
  },
  thumbnail: {
    width: '80px',
    height: '100px',
    borderRadius: tokens.borderRadiusSmall,
    objectFit: 'cover',
    cursor: 'pointer',
    ...shorthands.border('2px', 'solid', tokens.colorNeutralStroke2),
    transition: 'all 0.2s ease',
    flexShrink: 0,
    '&:hover': {
      ...shorthands.border('2px', 'solid', tokens.colorBrandForeground1),
    },
  },
  thumbnailActive: {
    ...shorthands.border('2px', 'solid', tokens.colorBrandForeground1),
    boxShadow: tokens.shadow8,
  },
  thumbnailPlaceholder: {
    width: '80px',
    height: '100px',
    borderRadius: tokens.borderRadiusSmall,
    backgroundColor: tokens.colorNeutralBackground2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.border('2px', 'solid', tokens.colorNeutralStroke2),
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
    fontSize: tokens.fontSizeBase300,
    '&:hover': {
      ...shorthands.border('2px', 'solid', tokens.colorBrandForeground1),
    },
  },
  thumbnailPlaceholderActive: {
    ...shorthands.border('2px', 'solid', tokens.colorBrandForeground1),
    boxShadow: tokens.shadow8,
  },
  noPhotos: {
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    marginTop: '16px',
    ...shorthands.padding('24px'),
  },
});

export default function PersonMoviesModal({ open, onOpenChange, personName, personInfo, movies, photos, loading, imageBaseUrl, onMovieClick }: PersonMoviesModalProps) {
  const styles = useStyles();
  const [creditsExpanded, setCreditsExpanded] = useState(false);
  const [photosExpanded, setPhotosExpanded] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (!open) {
      setCreditsExpanded(false);
      setPhotosExpanded(false);
    }
  }, [open]);

  const handleMovieClick = (movieId: number) => {
    if (onMovieClick) {
      onMovieClick(movieId);
    }
  };

  const handlePreviousPhoto = () => {
    if (photos && photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    }
  };

  const handleNextPhoto = () => {
    if (photos && photos.length > 0) {
      setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    }
  };

  const getImageUrl = (path: string | null): string | null => {
    if (!path || !imageBaseUrl) return null;
    return `${imageBaseUrl}w185${path}`;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (!personName) return null;

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface className={styles.dialogSurface}>
        <DialogBody>
          <DialogTitle>{personInfo ? personInfo.name : ''}</DialogTitle>
          <DialogContent className={styles.dialogContent}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <Spinner size="large" label="Loading filmography..." />
              </div>
            ) : (
              <>
                {/* Person Info Section */}
                {personInfo && (
                  <div className={styles.personInfoSection}>
                    <div>
                      {getImageUrl((personInfo.profile_path as string | null) || null) ? (
                        <img
                          src={getImageUrl((personInfo.profile_path as string | null) || null)!}
                          alt={personInfo.name}
                          className={styles.personHeadshot}
                        />
                      ) : (
                        <div className={styles.personHeadshotPlaceholder}>👤</div>
                      )}
                    </div>
                    <div className={styles.personBioDetails}>
                      <div className={styles.personDetailRow}>
                        <div className={styles.personDetailLabel}>Born</div>
                        <div className={styles.personDetailValue}>
                          {personInfo.birthday ? formatDate(personInfo.birthday) : 'N/A'} ({personInfo.place_of_birth || 'N/A'})
                        </div>
                      </div>

                      {personInfo.biography && (
                        <div>
                          <div className={styles.personDetailLabel}>Biography</div>
                          <div className={styles.biography}>
                            {personInfo.biography}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Credits Header with Toggle */}
                {movies && movies.length > 0 && (
                  <>
                    <button
                      className={styles.creditsHeaderButton}
                      onClick={() => setCreditsExpanded(!creditsExpanded)}
                    >
                      <span className={`${styles.chevronIcon} ${creditsExpanded ? styles.chevronExpanded : ''}`}>
                        <ChevronDownRegular />
                      </span>
                      🎬 Credits ({movies.length})
                    </button>

                    {creditsExpanded && (
                      <div className={styles.personMoviesGrid}>
                        {movies
                          .slice(0, 255)
                          .sort((a, b) => {
                            const dateA = new Date(a.release_date || '').getTime();
                            const dateB = new Date(b.release_date || '').getTime();
                            return dateB - dateA;
                          })
                          .map((movie) => (
                            <div
                              key={movie.id}
                              className={styles.personMovieCard}
                              onClick={() => handleMovieClick(movie.id)}
                              title={`Click to view ${movie.title}`}
                            >
                              {getImageUrl(movie.poster_path) ? (
                                <img
                                  src={getImageUrl(movie.poster_path)!}
                                  alt={movie.title}
                                  className={styles.personMoviePoster}
                                />
                              ) : (
                                <div className={styles.personMoviePosterPlaceholder}>📽️</div>
                              )}
                              <div className={styles.personMovieTitle} title={movie.title}>
                                {movie.title}
                              </div>
                              {movie.character && (
                                <div className={styles.personMovieCharacter} title={movie.character}>
                                  as {movie.character}
                                </div>
                              )}
                              {movie.release_date && (
                                <div className={styles.personMovieRelease}>
                                  {formatDate(movie.release_date)}
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </>
                )}
                {movies && movies.length === 0 && (
                  <div className={styles.noMovies}>No movies found for this person.</div>
                )}

                {/* Photos Carousel Section */}
                {photos && photos.length > 0 && (
                  <>
                    <button
                      className={styles.photosHeaderButton}
                      onClick={() => setPhotosExpanded(!photosExpanded)}
                    >
                      <span className={`${styles.chevronIcon} ${photosExpanded ? styles.chevronExpanded : ''}`}>
                        <ChevronDownRegular />
                      </span>
                      📸 Photos ({photos.length})
                    </button>

                    {photosExpanded && (
                      <>
                        <div className={styles.carouselContainer}>
                          <button
                            className={styles.carouselButton}
                            onClick={handlePreviousPhoto}
                            disabled={photos.length <= 1}
                            title="Previous photo"
                          >
                            <ChevronLeftRegular />
                          </button>
                          <div className={styles.carouselContent}>
                            {getImageUrl(photos[currentPhotoIndex]?.file_path) && (
                              <img
                                src={getImageUrl(photos[currentPhotoIndex]?.file_path)!}
                                alt={`Actor photo ${currentPhotoIndex + 1}`}
                                className={styles.carouselImage}
                              />
                            )}
                          </div>
                          <button
                            className={styles.carouselButton}
                            onClick={handleNextPhoto}
                            disabled={photos.length <= 1}
                            title="Next photo"
                          >
                            <ChevronRightRegular />
                          </button>
                        </div>
                        <div className={styles.carouselCounter}>
                          {currentPhotoIndex + 1} of {photos.length}
                        </div>

                        {/* Thumbnail Strip */}
                        <div className={styles.thumbnailStrip}>
                          {photos.map((photo, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentPhotoIndex(index)}
                              className={`${
                                getImageUrl(photo.file_path)
                                  ? styles.thumbnail
                                  : styles.thumbnailPlaceholder
                              } ${index === currentPhotoIndex ? (getImageUrl(photo.file_path) ? styles.thumbnailActive : styles.thumbnailPlaceholderActive) : ''}`}
                              title={`Photo ${index + 1}`}
                              style={{
                                background: getImageUrl(photo.file_path)
                                  ? `url(${getImageUrl(photo.file_path)}) center/cover no-repeat`
                                  : undefined,
                              }}
                            >
                              {!getImageUrl(photo.file_path) && '📸'}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
