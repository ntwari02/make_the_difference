import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  GridLegacy as Grid,
  Avatar,
  Rating,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Pagination,
  Button as MuiButton,
} from '@mui/material';
import {
  Star as StarIcon,
  Reply as ReplyIcon,
  ThumbUp as ThumbUpIcon,
} from '@mui/icons-material';
import SellerLayout from '../components/layout/SellerLayout';
import { sellerApi } from '../services/sellerApi';
import toast from 'react-hot-toast';

interface Review {
  id: string;
  buyer: {
    name: string;
    avatar: string;
  };
  car: {
    make: string;
    model: string;
    year: number;
  };
  rating: number;
  comment: string;
  timestamp: string;
  helpful: number;
  verified: boolean;
  sellerResponse?: string | null;
}

const SellerReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyDialog, setReplyDialog] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'helpful' | 'rating'>('newest');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [distribution, setDistribution] = useState([0, 0, 0, 0, 0]);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 8;

  useEffect(() => {
    loadReviews();
  }, [page, ratingFilter, search, sortBy]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const result = await sellerApi.reviews.getSellerReviews({
        page,
        limit: rowsPerPage,
        rating: ratingFilter === 'all' ? undefined : ratingFilter,
        search: search || undefined,
        sortBy,
      });
      
      setReviews(result.reviews || []);
      setAverageRating(result.averageRating || 0);
      setTotalReviews(result.pagination?.total || 0);
      setTotalPages(result.pagination?.totalPages || 1);
      setDistribution(result.distribution || [0, 0, 0, 0, 0]);
    } catch (error: any) {
      console.error('Failed to load reviews:', error);
      toast.error(error?.response?.data?.message || 'Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const paged = reviews;

  const exportCsv = () => {
    const rows: string[] = [];
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    rows.push('Buyer,Car,Rating,Helpful,Verified,Date,Comment');
    reviews.forEach((r) => {
      rows.push([
        esc(r.buyer.name),
        esc(`${r.car.year} ${r.car.make} ${r.car.model}`),
        r.rating,
        r.helpful,
        r.verified ? 'Yes' : 'No',
        new Date(r.timestamp).toLocaleDateString(),
        esc(r.comment),
      ].join(','));
    });
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seller-reviews.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReply = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.sellerResponse || '');
    setReplyDialog(true);
  };

  const handleSendReply = async () => {
    if (!selectedReview || !replyText.trim()) return;
    
    try {
      await sellerApi.reviews.replyToReview(selectedReview.id, replyText);
      toast.success('Reply posted successfully');
      setReplyText('');
      setReplyDialog(false);
      setSelectedReview(null);
      await loadReviews(); // Reload to show the reply
    } catch (error: any) {
      console.error('Failed to post reply:', error);
      toast.error(error?.response?.data?.message || 'Failed to post reply');
    }
  };

  return (
    <SellerLayout>
      <Box sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Customer Reviews
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700}>
                {averageRating.toFixed(1)}
              </Typography>
              <Rating value={averageRating} readOnly precision={0.1} />
              <Typography variant="body2" color="text.secondary">
                {totalReviews} reviews
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Filters and distribution */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filter by rating</InputLabel>
                  <Select value={ratingFilter} label="Filter by rating" onChange={(e) => setRatingFilter(e.target.value as any)}>
                    <MenuItem value="all">All ratings</MenuItem>
                    <MenuItem value={5}>5 stars</MenuItem>
                    <MenuItem value={4}>4 stars</MenuItem>
                    <MenuItem value={3}>3 stars</MenuItem>
                    <MenuItem value={2}>2 stars</MenuItem>
                    <MenuItem value={1}>1 star</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField 
                  fullWidth 
                  size="small" 
                  placeholder="Search reviews..." 
                  value={search} 
                  onChange={(e) => { 
                    setSearch(e.target.value); 
                    setPage(1); 
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      loadReviews();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort by</InputLabel>
                  <Select value={sortBy} label="Sort by" onChange={(e) => setSortBy(e.target.value as any)}>
                    <MenuItem value="newest">Newest</MenuItem>
                    <MenuItem value="oldest">Oldest</MenuItem>
                    <MenuItem value="helpful">Most helpful</MenuItem>
                    <MenuItem value="rating">Highest rating</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              {([5,4,3,2,1] as const).map((stars) => {
                const count = distribution[stars - 1];
                const pct = totalReviews ? Math.round((count / totalReviews) * 100) : 0;
                return (
                  <Box key={stars} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Box sx={{ width: 64, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ width: 20 }}>{stars}</Typography>
                      <StarIcon fontSize="small" color="warning" />
                    </Box>
                    <LinearProgress variant="determinate" value={pct} sx={{ flex: 1, height: 8, borderRadius: 4 }} />
                    <Typography variant="caption" sx={{ width: 48, textAlign: 'right' }}>{count} ({pct}%)</Typography>
                  </Box>
                );
              })}
            </Box>
          </CardContent>
        </Card>

        {/* Reviews List */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading reviews...
            </Typography>
          </Box>
        ) : paged.length === 0 ? (
          <Card sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No reviews found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {search || ratingFilter !== 'all' ? 'Try adjusting your filters' : 'You don\'t have any reviews yet'}
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {paged.map((review) => (
            <Grid item xs={12} key={review.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 3 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      {review.buyer.name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {review.buyer.name}
                        </Typography>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          ({review.rating}/5)
                        </Typography>
                        {review.verified && (
                          <Chip label="Verified Purchase" size="small" color="success" />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {review.car.year} {review.car.make} {review.car.model}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {review.comment}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.timestamp).toLocaleDateString()}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ThumbUpIcon fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {review.helpful} found this helpful
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          startIcon={<ReplyIcon />}
                          onClick={() => handleReply(review)}
                          variant={review.sellerResponse ? "outlined" : "text"}
                        >
                          {review.sellerResponse ? 'Edit Reply' : 'Reply'}
                        </Button>
                      </Box>
                      {review.sellerResponse && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Your Response:
                          </Typography>
                          <Typography variant="body2">
                            {review.sellerResponse}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        )}

        {/* Pagination and Export */}
        {!loading && totalReviews > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Pagination 
              page={page} 
              onChange={(_, p) => setPage(p)} 
              count={totalPages} 
              color="primary" 
            />
            <MuiButton variant="outlined" onClick={exportCsv}>Export CSV</MuiButton>
          </Box>
        )}

        {/* Reply Dialog */}
        <Dialog
          open={replyDialog}
          onClose={() => setReplyDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          {selectedReview && (
            <>
              <DialogTitle>
                Reply to Review
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Review by {selectedReview.buyer.name}:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    "{selectedReview.comment}"
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Write your response..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setReplyDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                >
                  Send Reply
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </SellerLayout>
  );
};

export default SellerReviews;
