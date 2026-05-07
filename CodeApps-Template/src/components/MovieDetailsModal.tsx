import { Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, DialogActions, Button, makeStyles, shorthands, tokens, Spinner, Textarea, Body1Strong, Caption1, Avatar } from '@fluentui/react-components';
import { ChevronDownRegular, StarRegular, StarFilled, StarHalfRegular, DeleteRegular, EditRegular, DismissRegular } from '@fluentui/react-icons';
import { useState, useEffect } from 'react';
import { ReviewsService } from '../generated/services/ReviewsService';
import { Office365UsersService } from '../generated/services/Office365UsersService';
import type { Reviews } from '../generated/models/ReviewsModel';
import { getContext } from '@microsoft/power-apps/app';
import type { CastMember, Video } from '../types/TMDBTypes';
import type { MovieDetailsModalProps } from '../types/MovieComponentTypes';

const useStyles = makeStyles({
  dialogSurface: {
    maxWidth: '1000px',
    width: '90vw',
  },
  dialogContent: {
    maxWidth: '90vw',
    width: '100%',
  },
  movieHeader: {
    display: 'grid',
    gridTemplateColumns: '150px 1fr',
    ...shorthands.gap('24px'),
    marginBottom: '24px',
  },
  posterImage: {
    width: '150px',
    height: 'auto',
    borderRadius: tokens.borderRadiusMedium,
    boxShadow: tokens.shadow16,
  },
  posterPlaceholder: {
    width: '150px',
    height: '225px',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground3,
  },
  movieInfo: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
  overview: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.5',
    marginBottom: '24px',
  },
  sectionHeaderButton: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
    cursor: 'pointer',
    padding: '8px 0',
    border: 'none',
    background: 'none',
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    transition: 'color 0.2s ease',
    marginBottom: '12px',
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
  castGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    ...shorthands.gap('16px'),
    marginBottom: '16px',
  },
  castMember: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, opacity 0.2s ease',
    '&:hover': {
      transform: 'scale(1.05)',
      opacity: 0.8,
    },
  },
  castImage: {
    width: '100%',
    aspectRatio: '3/4',
    borderRadius: tokens.borderRadiusMedium,
    objectFit: 'cover',
    marginBottom: '8px',
    backgroundColor: tokens.colorNeutralBackground2,
  },
  castImagePlaceholder: {
    width: '100%',
    aspectRatio: '3/4',
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: tokens.fontSizeBase200,
    marginBottom: '8px',
    color: tokens.colorNeutralForeground3,
  },
  castName: {
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
  castCharacter: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
  },
  noCast: {
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.padding('40px', '0'),
  },
  ratingBadge: {
    display: 'inline-block',
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    ...shorthands.padding('4px', '12px'),
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
  },
  videosGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    ...shorthands.gap('16px'),
    marginBottom: '24px',
  },
  videoCard: {
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground2,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 4px 12px ${tokens.colorNeutralShadowAmbient}`,
    },
  },
  videoThumbnail: {
    width: '100%',
    aspectRatio: '16/9',
    backgroundColor: tokens.colorNeutralBackground3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: tokens.fontSizeBase300,
    position: 'relative',
  },
  playButton: {
    fontSize: '32px',
    position: 'absolute',
    zIndex: 1,
  },
  videoInfo: {
    ...shorthands.padding('12px'),
  },
  videoName: {
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
  videoType: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
  noVideos: {
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  videoPlayer: {
    width: '100%',
    aspectRatio: '16/9',
    borderRadius: tokens.borderRadiusMedium,
    marginBottom: '16px',
  },
  videoPlayerContainer: {
    position: 'relative',
    marginBottom: '16px',
  },
  closeVideoButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    zIndex: 2,
  },
  reviewForm: {
    ...shorthands.padding('16px'),
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    marginBottom: '16px',
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
  },
  ratingSelector: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('8px'),
  },
  reviewsList: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('12px'),
  },
  reviewCard: {
    ...shorthands.padding('12px'),
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
    borderLeft: `4px solid ${tokens.colorBrandForeground1}`,
  },
  reviewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  reviewRating: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap('4px'),
  },
  reviewDate: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
  reviewText: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.5',
  },
  noReviews: {
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  averageRatingContainer: {
    ...shorthands.padding('12px'),
    marginBottom: '12px',
  },
  reviewerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
});

export default function MovieDetailsModal({ open, onOpenChange, movie, cast, videos, loading, imageBaseUrl, onCastMemberClick }: MovieDetailsModalProps) {
  const styles = useStyles();
  const [expandedVideoKey, setExpandedVideoKey] = useState<string | null>(null);
  const [castExpanded, setCastExpanded] = useState(false);
  const [videosExpanded, setVideosExpanded] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [reviews, setReviews] = useState<Reviews[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingReviewRating, setEditingReviewRating] = useState(5);
  const [editingReviewText, setEditingReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [userDisplayNames, setUserDisplayNames] = useState<Record<string, string>>({});
  const [userPhotos, setUserPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setCastExpanded(false);
      setVideosExpanded(false);
      setReviewsExpanded(false);
    } else if (movie) {
      loadReviews();
      loadCurrentUser();
    }
  }, [open, movie]);

  useEffect(() => {
    reviews.forEach((review) => {
      if (review.reviewerId && !userDisplayNames[review.reviewerId]) {
        loadUserDisplayName(review.reviewerId);
      }
    });
  }, [reviews]);

  const loadCurrentUser = async () => {
    try {
      const userContext = await getContext();
      const userEmail = userContext.user.userPrincipalName || 'anonymous';
      setCurrentUserEmail(userEmail);
    } catch (error) {
      console.error('Error getting user context:', error);
      setCurrentUserEmail(null);
    }
  };

  const loadUserDisplayName = async (userEmail: string) => {
    try {
      const result = await Office365UsersService.UserProfile_V2(userEmail, 'displayName');
      if (result.data && (result.data as any).displayName) {
        setUserDisplayNames((prev) => ({
          ...prev,
          [userEmail]: (result.data as any).displayName,
        }));
      }
      loadUserPhoto(userEmail);
    } catch (error) {
      console.error(`Error loading display name for ${userEmail}:`, error);
    }
  };

  const loadUserPhoto = async (userEmail: string) => {
    try {
      const result = await Office365UsersService.UserPhoto(userEmail);
      if (result.data) {
        setUserPhotos((prev) => ({
          ...prev,
          [userEmail]: `data:image/jpeg;base64,${result.data}`,
        }));
      }
    } catch (error) {
      console.error(`Error loading photo for ${userEmail}:`, error);
    }
  };

  const loadReviews = async () => {
    if (!movie) return;

    setReviewsLoading(true);
    try {
      const result = await ReviewsService.getAll({
        filter: `movieId eq '${movie.id}'`,
      });

      if (result.data) {
        setReviews(Array.isArray(result.data) ? result.data : [result.data]);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddReview = async () => {
    if (!movie || !newReviewText.trim()) return;

    setSubmittingReview(true);
    try {
      const userContext = await getContext();
      const userEmail = userContext.user.userPrincipalName || 'anonymous';
      const reviewId = crypto.randomUUID();

      const newReview: Reviews = {
        reviewId,
        movieId: movie.id.toString(),
        rating: newReviewRating,
        review: newReviewText,
        reviewerId: userEmail,
        reviewDate: new Date().toISOString(),
      };

      const result = await ReviewsService.create(newReview);

      if (result.data) {
        setReviews([...reviews, result.data]);
        setNewReviewRating(5);
        setNewReviewText('');
      }
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Failed to add review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = async (reviewId: string, reviewerId: string) => {
    if (currentUserEmail !== reviewerId) {
      alert('You can only edit your own reviews.');
      return;
    }

    if (!editingReviewText.trim()) return;

    setSubmittingReview(true);
    try {
      const updatedFields: Partial<Omit<Reviews, 'reviewId'>> = {
        rating: editingReviewRating,
        review: editingReviewText,
        reviewDate: new Date().toISOString(),
      };

      await ReviewsService.update(reviewId, updatedFields);

      setReviews(
        reviews.map((r) =>
          r.reviewId === reviewId
            ? {
                ...r,
                rating: editingReviewRating,
                review: editingReviewText,
                reviewDate: new Date().toISOString(),
              }
            : r
        )
      );

      setEditingReviewId(null);
      setEditingReviewRating(5);
      setEditingReviewText('');
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string, reviewerId: string) => {
    if (currentUserEmail !== reviewerId) {
      alert('You can only delete your own reviews.');
      return;
    }

    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await ReviewsService.delete(reviewId);
      setReviews(reviews.filter((r) => r.reviewId !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review. Please try again.');
    }
  };

  const startEditReview = (review: Reviews) => {
    setEditingReviewId(review.reviewId);
    setEditingReviewRating(review.rating);
    setEditingReviewText(review.review || '');
  };

  const cancelEditReview = () => {
    setEditingReviewId(null);
    setEditingReviewRating(5);
    setEditingReviewText('');
  };

  const handleCastMemberClick = (memberId: number, memberName: string) => {
    if (onCastMemberClick) {
      onCastMemberClick(memberId, memberName);
    }
  };

  const formatDateUS = (dateString: string | undefined): string => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Just now';
    }
  };

  const getImageUrl = (path: string | null): string | null => {
    if (!path || !imageBaseUrl) return null;
    return `${imageBaseUrl}w342${path}`;
  };

  const getProfileImageUrl = (path: string | null): string | null => {
    if (!path || !imageBaseUrl) return null;
    return `${imageBaseUrl}w185${path}`;
  };

  if (!movie) return null;

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface className={styles.dialogSurface}>
        <DialogBody>
          <DialogTitle>{movie.title}</DialogTitle>
          <DialogContent className={styles.dialogContent}>
            {loading ? (
              <div className={styles.loadingContainer}>
                <Spinner size="large" label="Loading movie information..." />
              </div>
            ) : (
              <>
                {/* Movie Header */}
                <div className={styles.movieHeader}>
                  <div>
                    {getImageUrl(movie.poster_path) ? (
                      <img src={getImageUrl(movie.poster_path)!} alt={movie.title} className={styles.posterImage} />
                    ) : (
                      <div className={styles.posterPlaceholder}>📽️ No Image</div>
                    )}
                  </div>
                  <div className={styles.movieInfo}>
                    <div className={styles.infoRow}>
                      <div className={styles.overview}><strong>Overview:</strong> {movie.overview || 'No overview available.'}</div>
                    </div>
                    <div className={styles.infoRow}>
                      <span>📅 Released: {formatDateUS(movie.release_date)}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span>🔥 Popularity: {movie.popularity.toFixed(1)}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span>🍅 Public Rating: {movie.vote_average.toFixed(1)}/10</span>
                    </div>
                  </div>
                </div>

                {/* Cast */}
                <button
                  className={styles.sectionHeaderButton}
                  onClick={() => setCastExpanded(!castExpanded)}
                >
                  <span className={`${styles.chevronIcon} ${castExpanded ? styles.chevronExpanded : ''}`}>
                    <ChevronDownRegular />
                  </span>
                  🎭 Cast ({cast.length})
                </button>
                {castExpanded && (
                  <>
                    {cast && cast.length > 0 ? (
                      <div className={styles.castGrid}>
                        {cast.slice(0, 255).map((member) => (
                          <div
                            key={`${member.id}-${member.character}`}
                            className={styles.castMember}
                            onClick={() => handleCastMemberClick(member.id, member.name)}
                            title={`Click to view ${member.name}'s filmography`}
                          >
                            {getProfileImageUrl(member.profile_path) ? (
                              <img
                                src={getProfileImageUrl(member.profile_path)!}
                                alt={member.name}
                                className={styles.castImage}
                              />
                            ) : (
                              <div className={styles.castImagePlaceholder}>👤</div>
                            )}
                            <div className={styles.castName} title={member.name}>
                              {member.name}
                            </div>
                            <div className={styles.castCharacter} title={member.character}>
                              as {member.character}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.noCast}>No cast information available.</div>
                    )}
                  </>
                )}

                {/* Videos */}
                <button
                  className={styles.sectionHeaderButton}
                  onClick={() => setVideosExpanded(!videosExpanded)}
                >
                  <span className={`${styles.chevronIcon} ${videosExpanded ? styles.chevronExpanded : ''}`}>
                    <ChevronDownRegular />
                  </span>
                  🎥 Videos ({videos.length})
                </button>
                {videosExpanded && (
                  <>
                    {videos && videos.length > 0 ? (
                      <>
                        {expandedVideoKey && (
                          <div className={styles.videoPlayerContainer}>
                            <iframe
                              className={styles.videoPlayer}
                              src={`https://www.youtube.com/embed/${expandedVideoKey}?autoplay=1`}
                              title="Video Player"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                            <Button
                              className={styles.closeVideoButton}
                              icon={<DismissRegular />}
                              appearance="secondary"
                              onClick={() => setExpandedVideoKey(null)}
                              title="Close video player"
                            >
                              Close
                            </Button>
                          </div>
                        )}
                        <div className={styles.videosGrid}>
                          {videos.map((video) => (
                            <div
                              key={video.id}
                              className={styles.videoCard}
                              onClick={() => setExpandedVideoKey(video.key)}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className={styles.videoThumbnail}>
                                <img
                                  src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                                  alt={video.name}
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div className={styles.playButton}>▶️</div>
                              </div>
                              <div className={styles.videoInfo}>
                                <div className={styles.videoName} title={video.name}>
                                  {video.name}
                                </div>
                                <div className={styles.videoType}>{video.type}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className={styles.noVideos}>No videos available.</div>
                    )}
                  </>
                )}

                {/* Private Reviews */}
                <button
                  className={styles.sectionHeaderButton}
                  onClick={() => setReviewsExpanded(!reviewsExpanded)}
                >
                  <span className={`${styles.chevronIcon} ${reviewsExpanded ? styles.chevronExpanded : ''}`}>
                    <ChevronDownRegular />
                  </span>
                  🍿 Private Reviews
                </button>
                {reviewsExpanded && (
                  <>
                    {reviewsLoading ? (
                      <div className={styles.loadingContainer}>
                        <Spinner size="small" label="Loading reviews..." />
                      </div>
                    ) : (
                      <>
                        {/* Average Rating */}
                        {reviews.length > 0 && (
                          <div className={styles.averageRatingContainer}>
                            <Body1Strong>
                              Average Rating:
                            </Body1Strong>
                            {(() => {
                              const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
                              const fullStars = Math.floor(avg);
                              const hasHalfStar = avg % 1 >= 0.5;
                              const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
                              return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                  <span style={{ color: tokens.colorBrandForeground1, fontSize: tokens.fontSizeBase600 }}>
                                    <strong>{avg.toFixed(1)}/5</strong>
                                  </span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {[...Array(fullStars)].map((_, i) => (
                                      <StarFilled key={`full-${i}`} style={{ color: tokens.colorStatusWarningForeground1, fontSize: '18px' }} />
                                    ))}
                                    {hasHalfStar && (
                                      <StarHalfRegular style={{ color: tokens.colorStatusWarningForeground1, fontSize: '18px' }} />
                                    )}
                                    {[...Array(emptyStars)].map((_, i) => (
                                      <StarRegular key={`empty-${i}`} style={{ fontSize: '18px' }} />
                                    ))}
                                  </div>
                                  <span style={{ color: tokens.colorNeutralForeground2, fontSize: tokens.fontSizeBase200 }}>
                                    ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Add Review Form */}
                        {editingReviewId === null && !reviews.some((r) => r.reviewerId === currentUserEmail) && (
                          <div className={styles.reviewForm}>
                            <Body1Strong>Add Your Review</Body1Strong>
                            <div className={styles.ratingSelector}>
                              <span>Rating:</span>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => setNewReviewRating(star)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
                                  title={`${star} stars`}
                                >
                                  {star <= newReviewRating ? (
                                    <StarFilled style={{ color: tokens.colorStatusWarningForeground1 }} />
                                  ) : (
                                    <StarRegular />
                                  )}
                                </button>
                              ))}
                              <span style={{ marginLeft: '8px', color: tokens.colorNeutralForeground2 }}>
                                {newReviewRating}/5
                              </span>
                            </div>
                            <Textarea
                              placeholder="Share your thoughts about this movie..."
                              value={newReviewText}
                              onChange={(_, data) => setNewReviewText(data.value)}
                              maxLength={500}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <Button
                                appearance="primary"
                                onClick={handleAddReview}
                                disabled={!newReviewText.trim() || submittingReview}
                              >
                                {submittingReview ? 'Submitting...' : 'Submit Review'}
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Reviews List */}
                        {reviews.length > 0 ? (
                          <div className={styles.reviewsList}>
                            {[...reviews].sort((a, b) => {
                              const dateA = a.reviewDate ? new Date(a.reviewDate).getTime() : 0;
                              const dateB = b.reviewDate ? new Date(b.reviewDate).getTime() : 0;
                              return dateB - dateA;
                            }).map((review) => (
                              <div key={review.reviewId} className={styles.reviewCard}>
                                {editingReviewId === review.reviewId ? (
                                  <>
                                    <div className={styles.ratingSelector}>
                                      <span>Rating:</span>
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          onClick={() => setEditingReviewRating(star)}
                                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}
                                          title={`${star} stars`}
                                        >
                                          {star <= editingReviewRating ? (
                                            <StarFilled style={{ color: tokens.colorStatusWarningForeground1 }} />
                                          ) : (
                                            <StarRegular />
                                          )}
                                        </button>
                                      ))}
                                      <span style={{ marginLeft: '8px', color: tokens.colorNeutralForeground2 }}>
                                        {editingReviewRating}/5
                                      </span>
                                    </div>
                                    <Textarea
                                      value={editingReviewText}
                                      onChange={(_, data) => setEditingReviewText(data.value)}
                                      maxLength={500}
                                      style={{ marginBottom: '12px', width: '100%', minHeight: '150px' }}
                                    />
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                      <Button
                                        appearance="primary"
                                        onClick={() => handleEditReview(review.reviewId, review.reviewerId)}
                                        disabled={!editingReviewText.trim() || submittingReview}
                                      >
                                        {submittingReview ? 'Saving...' : 'Save Changes'}
                                      </Button>
                                      <Button
                                        appearance="secondary"
                                        onClick={cancelEditReview}
                                        disabled={submittingReview}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className={styles.reviewHeader}>
                                      <div className={styles.reviewerInfo}>
                                        <Avatar
                                          name={userDisplayNames[review.reviewerId] || review.reviewerId}
                                          size={32}
                                          image={userPhotos[review.reviewerId] ? { src: userPhotos[review.reviewerId] } : undefined}
                                        />
                                        <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                                          by {userDisplayNames[review.reviewerId] || review.reviewerId}
                                        </Caption1>
                                      </div>
                                      <div style={{ display: 'flex', gap: '8px' }}>
                                        <Button
                                          icon={<EditRegular />}
                                          appearance="subtle"
                                          onClick={() => startEditReview(review)}
                                          disabled={currentUserEmail !== review.reviewerId}
                                          title={currentUserEmail === review.reviewerId ? 'Edit review' : 'You can only edit your own reviews'}
                                        />
                                        <Button
                                          icon={<DeleteRegular />}
                                          appearance="subtle"
                                          onClick={() => handleDeleteReview(review.reviewId, review.reviewerId)}
                                          disabled={currentUserEmail !== review.reviewerId}
                                          title={currentUserEmail === review.reviewerId ? 'Delete review' : 'You can only delete your own reviews'}
                                        />
                                      </div>
                                    </div>
                                    <div className={styles.reviewRating}>
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star}>
                                          {star <= review.rating ? (
                                            <StarFilled style={{ color: tokens.colorStatusWarningForeground1 }} />
                                          ) : (
                                            <StarRegular />
                                          )}
                                        </span>
                                      ))}
                                    </div>
                                    <div className={styles.reviewText}>{review.review}</div>
                                    <Caption1 className={styles.reviewDate}>
                                      {formatDateUS(review.reviewDate)}
                                    </Caption1>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className={styles.noReviews}>
                            {reviewsLoading ? 'Loading reviews...' : 'No reviews yet. Be the first to review!'}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={() => { onOpenChange(false); setExpandedVideoKey(null); }}>
              Close
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
