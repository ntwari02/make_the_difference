import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Rating,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  LinearProgress,
  Snackbar
} from '@mui/material';
import {
  Star as StarIcon,
  ThumbUp as ThumbUpIcon,
  Reply as ReplyIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { RootState } from '../../../core/store';
import { sellerApi } from '../services/sellerApi';
import SellerLayout from '../components/layout/SellerLayout';

const SellerReviews: React.FC = () => {
  console.log('🚀 SellerReviews component mounted');
  
  const profile = useSelector((state: RootState) => state.seller.profile);
  const user = useSelector((state: RootState) => state.auth.user);

  console.log('📊 SellerReviews state:', {
    profile,
    user,
    'profile?.id': profile?.id,
    'user?.id': user?.id
  });

  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [replyDialog, setReplyDialog] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful' | 'rating'>('newest');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [pagination, setPagination] = useState<any>(null);

  // Load seller reviews from API
  const loadReviews = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use user.id if profile.id is not available
      const sellerId = profile?.id || user?.id;
      if (!sellerId) {
        throw new Error('Seller ID not found');
      }

      console.log('🔍 Loading reviews for seller ID:', sellerId);

      const result = await sellerApi.sellerReviews.getSellerReviews(sellerId, {
        page: pageNum,
        limit: 8
      });

      console.log('📊 Reviews API response:', result);
      console.log('📊 Reviews data:', result.reviews);
      console.log('📊 Statistics:', result.statistics);
      console.log('📊 Pagination:', result.pagination);

      setReviews(result.reviews);
      setStatistics(result.statistics);
      setPagination(result.pagination);

    } catch (err: any) {
      console.error('❌ Error loading reviews:', err);
      console.error('❌ Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 SellerReviews useEffect triggered:', {
      'profile?.id': profile?.id,
      'user?.id': user?.id,
      'profile': profile,
      'user': user
    });
    loadReviews(page);
  }, [profile?.id, user?.id, page]);

  // Use statistics from API instead of calculating from reviews
  const averageRating = statistics?.averageRating || 0;
  const totalReviews = statistics?.totalReviews || 0;

  const distribution = useMemo(() => {
    return [
      statistics?.ratingDistribution?.[5] || 0,  // 5 stars
      statistics?.ratingDistribution?.[4] || 0,  // 4 stars
      statistics?.ratingDistribution?.[3] || 0,  // 3 stars
      statistics?.ratingDistribution?.[2] || 0,  // 2 stars
      statistics?.ratingDistribution?.[1] || 0,  // 1 star
    ];
  }, [statistics?.ratingDistribution]);

  const filtered = useMemo(() => {
    if (!reviews || !Array.isArray(reviews)) {
      return [];
    }
    
    const base = reviews.filter((r) => {
      const okRating = ratingFilter === 'all' || Math.round(r.rating) === ratingFilter;
      const reviewerName = `${r.first_name || ''} ${r.last_name || ''}`.trim();
      const okSearch = search === '' || 
        (r.comment && r.comment.toLowerCase().includes(search.toLowerCase())) || 
        reviewerName.toLowerCase().includes(search.toLowerCase());
      return okRating && okSearch;
    });
    const sorted = [...base].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'helpful':
          return b.helpful_count - a.helpful_count;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });
    return sorted;
  }, [reviews, ratingFilter, search, sortBy]);

  // Use reviews directly since pagination is handled by API
  const paged = filtered;

  const exportCsv = () => {
    const csvContent = [
      ['Reviewer', 'Rating', 'Comment', 'Date', 'Helpful Votes'].join(','),
      ...paged.map(review => [
        `"${review.first_name} ${review.last_name}"`,
        review.rating,
        `"${(review.comment || '').replace(/"/g, '""')}"`,
        new Date(review.created_at).toLocaleDateString(),
        review.helpful_count || 0
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seller-reviews-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleReply = async () => {
    if (!selectedReview || !replyText.trim()) return;

    try {
      await sellerApi.sellerReviews.replyToReview(selectedReview.id, replyText);
      setSuccessMessage('Reply posted successfully!');
      setReplyDialog(false);
      setReplyText('');
      setSelectedReview(null);
      loadReviews(page);
    } catch (err: any) {
      setError(err.message || 'Failed to post reply');
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await sellerApi.sellerReviews.markReviewHelpful(reviewId);
      loadReviews(page);
    } catch (err: any) {
      setError(err.message || 'Failed to mark review as helpful');
    }
  };

  return (
    <SellerLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Customer Reviews
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {/* Overview */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" color="primary">
                    {averageRating.toFixed(1)}
                  </Typography>
                  <Rating value={averageRating} readOnly precision={0.1} size="large" />
                  <Typography variant="body2" color="text.secondary">
                    {totalReviews} reviews
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" gutterBottom>
                  Rating Distribution
                </Typography>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 20 }}>
                      {rating}
                    </Typography>
                    <StarIcon sx={{ color: 'warning.main', fontSize: 16, mr: 1 }} />
                    <Box sx={{ flexGrow: 1, mr: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={totalReviews > 0 ? (distribution[5 - rating] / totalReviews) * 100 : 0}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {totalReviews > 0 ? Math.round((distribution[5 - rating] / totalReviews) * 100) : 0}%
                    </Typography>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Filter by rating"
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value as number | 'all')}
                  size="small"
                >
                  <MenuItem value="all">All ratings</MenuItem>
                  <MenuItem value={5}>5 stars</MenuItem>
                  <MenuItem value={4}>4 stars</MenuItem>
                  <MenuItem value={3}>3 stars</MenuItem>
                  <MenuItem value={2}>2 stars</MenuItem>
                  <MenuItem value={1}>1 star</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Search reviews..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Sort by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  size="small"
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                  <MenuItem value="helpful">Most helpful</MenuItem>
                  <MenuItem value="rating">Highest rating</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Reviews List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : paged.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No reviews found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {search || ratingFilter !== 'all' 
                  ? 'Try adjusting your filters to see more reviews.'
                  : 'You haven\'t received any reviews yet.'}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {paged.map((review) => (
              <Grid item xs={12} key={review.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>
                          {review.first_name?.[0]}{review.last_name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1">
                            {review.first_name} {review.last_name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating value={review.rating} readOnly size="small" />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                              {new Date(review.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          icon={<ThumbUpIcon />}
                          label={review.helpful_count || 0}
                          size="small"
                          onClick={() => handleMarkHelpful(review.id)}
                          sx={{ cursor: 'pointer' }}
                        />
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedReview(review);
                            setReplyDialog(true);
                          }}
                        >
                          Reply
                        </Button>
                      </Box>
                    </Box>

                    {review.comment && (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {review.comment}
                      </Typography>
                    )}

                    {review.title && (
                      <Chip
                        label={review.title}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                    )}

                    {review.seller_reply && (
                      <Box sx={{ 
                        bgcolor: 'grey.50', 
                        p: 2, 
                        borderRadius: 1, 
                        borderLeft: 4, 
                        borderColor: 'primary.main',
                        mt: 2
                      }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          Your Reply
                        </Typography>
                        <Typography variant="body2">
                          {review.seller_reply}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.seller_reply_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination and Export */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Pagination 
            page={page} 
            onChange={(_, p) => setPage(p)} 
            count={pagination?.totalPages || 0} 
            color="primary" 
          />
          <Button variant="outlined" onClick={exportCsv} startIcon={<DownloadIcon />}>
            Export CSV
          </Button>
        </Box>

        {/* Reply Dialog */}
        <Dialog open={replyDialog} onClose={() => setReplyDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Reply to Review</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Replying to {selectedReview?.first_name} {selectedReview?.last_name}'s review
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReplyDialog(false)}>Cancel</Button>
            <Button onClick={handleReply} variant="contained" disabled={!replyText.trim()}>
              Post Reply
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SellerLayout>
  );
};

export default SellerReviews;