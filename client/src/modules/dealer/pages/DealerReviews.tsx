import React, { useState } from 'react';
import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  Button,
  useTheme,
  Rating,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  LinearProgress,
  Paper,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Star as StarIcon,
  StarHalf as StarHalfIcon,
  Search as SearchIcon,
  Reply as ReplyIcon,
  MoreVert as MoreIcon,
  Flag as FlagIcon,
  ThumbUp as ThumbUpIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FilterList as FilterIcon,
  CheckCircle as VerifiedIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DealerLayout from '../components/layout/DealerLayout';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Review {
  id: string;
  customer: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  rating: number;
  date: string;
  title: string;
  comment: string;
  vehicleName?: string;
  vehicleId?: string;
  helpful: number;
  reply?: {
    text: string;
    date: string;
  };
  tags: string[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const DealerReviews: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState('newest');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [tabValue, setTabValue] = useState(0);

  // Mock reviews data
  const mockReviews: Review[] = [
    {
      id: '1',
      customer: {
        name: 'John Smith',
        avatar: 'https://i.pravatar.cc/150?img=12',
        verified: true,
      },
      rating: 5,
      date: '2024-10-01',
      title: 'Excellent service and great car!',
      comment: 'I recently purchased a Tesla Model 3 from this dealership and I couldn\'t be happier. The sales team was professional, knowledgeable, and not pushy at all. They answered all my questions and helped me get a great financing deal. The car was in perfect condition and the delivery process was smooth. Highly recommend!',
      vehicleName: '2023 Tesla Model 3',
      vehicleId: '1',
      helpful: 12,
      tags: ['service', 'purchase', 'financing'],
      reply: {
        text: 'Thank you so much for your wonderful review, John! We\'re thrilled that you had a great experience with us. Enjoy your new Tesla!',
        date: '2024-10-02',
      },
    },
    {
      id: '2',
      customer: {
        name: 'Sarah Johnson',
        avatar: 'https://i.pravatar.cc/150?img=5',
        verified: true,
      },
      rating: 4,
      date: '2024-09-28',
      title: 'Good experience overall',
      comment: 'The buying process was smooth and the staff was friendly. Only minor issue was that it took a bit longer than expected to finalize the paperwork. But overall, I\'m happy with my BMW X5 and the service I received. Would recommend to friends.',
      vehicleName: '2024 BMW X5',
      vehicleId: '2',
      helpful: 8,
      tags: ['service', 'purchase'],
    },
    {
      id: '3',
      customer: {
        name: 'Michael Chen',
        avatar: 'https://i.pravatar.cc/150?img=8',
        verified: false,
      },
      rating: 5,
      date: '2024-09-25',
      title: 'Best dealership in town!',
      comment: 'I\'ve bought several cars over the years, and this was by far the best experience. The team went above and beyond to help me find the perfect vehicle within my budget. No hidden fees, transparent pricing, and excellent customer service. Will definitely come back for my next purchase!',
      helpful: 15,
      tags: ['service', 'pricing'],
      reply: {
        text: 'We truly appreciate your kind words! It was our pleasure to help you find your perfect vehicle. Thank you for choosing us!',
        date: '2024-09-26',
      },
    },
    {
      id: '4',
      customer: {
        name: 'Emily Davis',
        avatar: 'https://i.pravatar.cc/150?img=9',
        verified: true,
      },
      rating: 3,
      date: '2024-09-20',
      title: 'Average experience',
      comment: 'The car is great, but the service could be improved. Had to wait quite a bit before someone attended to me. The salesperson was nice but seemed rushed. Overall okay, but expected more given the positive reviews.',
      vehicleName: '2021 Mercedes-Benz C-Class',
      vehicleId: '4',
      helpful: 5,
      tags: ['service'],
    },
    {
      id: '5',
      customer: {
        name: 'David Wilson',
        avatar: 'https://i.pravatar.cc/150?img=11',
        verified: true,
      },
      rating: 5,
      date: '2024-09-18',
      title: 'Outstanding service!',
      comment: 'From test drive to delivery, everything was perfect. The staff took the time to explain all features of the vehicle and made sure I was comfortable with everything. Great follow-up after purchase as well. Couldn\'t ask for better service!',
      helpful: 10,
      tags: ['service', 'test-drive'],
      reply: {
        text: 'Thank you for the fantastic review, David! We\'re so glad we could provide you with an outstanding experience. Don\'t hesitate to reach out if you need anything!',
        date: '2024-09-19',
      },
    },
    {
      id: '6',
      customer: {
        name: 'Lisa Anderson',
        avatar: 'https://i.pravatar.cc/150?img=10',
        verified: false,
      },
      rating: 2,
      date: '2024-09-15',
      title: 'Disappointed with the experience',
      comment: 'Expected better based on the reviews. The car had some minor issues that weren\'t disclosed upfront. Customer service was okay but could be more responsive. Hope they improve their quality control.',
      vehicleName: '2023 Honda Civic Type R',
      vehicleId: '5',
      helpful: 3,
      tags: ['quality'],
    },
  ];

  const [reviews] = useState(mockReviews);

  // Calculate statistics
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: (reviews.filter((r) => r.rating === rating).length / totalReviews) * 100,
  }));

  const ratingTrend = [
    { month: 'Jun', rating: 4.2 },
    { month: 'Jul', rating: 4.5 },
    { month: 'Aug', rating: 4.6 },
    { month: 'Sep', rating: 4.8 },
    { month: 'Oct', rating: 4.8 },
  ];

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter((review) => {
      const matchesSearch =
        review.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRating = filterRating === 'all' || review.rating === filterRating;

      const matchesTab =
        (tabValue === 0) || // All
        (tabValue === 1 && !review.reply) || // Pending Reply
        (tabValue === 2 && review.reply); // Replied

      return matchesSearch && matchesRating && matchesTab;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

  const pendingReplyCount = reviews.filter((r) => !r.reply).length;

  const handleReply = () => {
    if (replyText.trim() && selectedReview) {
      toast.success('Reply posted successfully!');
      setReplyText('');
      setReplyDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getBarColor = (index: number, total: number) => {
    const ratio = index / (total - 1);
    return ratio < 0.5 ? '#06b6d4' : ratio < 0.75 ? '#14b8a6' : '#10b981';
  };

  return (
    <DealerLayout>
      <Box sx={{ width: '100%', maxWidth: '100%', m: 0, p: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Reviews & Ratings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage customer feedback and build your reputation
            </Typography>
          </Box>
        </Box>

        {/* Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Average Rating Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Overall Rating
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                  <Typography variant="h2" fontWeight={700} color="primary">
                    {averageRating.toFixed(1)}
                  </Typography>
                  <Typography variant="h5" color="text.secondary">
                    / 5.0
                  </Typography>
                </Box>
                <Rating value={averageRating} precision={0.1} size="large" readOnly sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Based on {totalReviews} reviews
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <TrendingUpIcon sx={{ color: 'success.main' }} />
                  <Typography variant="body2" color="success.main" fontWeight={600}>
                    +0.3 from last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Rating Distribution */}
          <Grid item xs={12} md={5}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Rating Distribution
                </Typography>
                {ratingDistribution.map((item) => (
                  <Box key={item.rating} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 60 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {item.rating}
                      </Typography>
                      <StarIcon sx={{ fontSize: 16, color: '#fbbf24', ml: 0.5 }} />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={item.percentage}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          background: 'linear-gradient(90deg, #06b6d4 0%, #14b8a6 50%, #10b981 100%)',
                          borderRadius: 4,
                        },
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40, textAlign: 'right' }}>
                      {item.count}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* Rating Trend Chart */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Trend
                </Typography>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={ratingTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="rgba(255,255,255,0.4)"
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <YAxis
                      domain={[0, 5]}
                      stroke="rgba(255,255,255,0.4)"
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="rating" radius={[4, 4, 0, 0]}>
                      {ratingTrend.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(index, ratingTrend.length)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters and Reviews */}
        <Card>
          <CardContent>
            {/* Tabs */}
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label={`All Reviews (${totalReviews})`} />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Pending Reply
                    {pendingReplyCount > 0 && (
                      <Chip label={pendingReplyCount} size="small" color="warning" />
                    )}
                  </Box>
                }
              />
              <Tab label="Replied" />
            </Tabs>

            {/* Toolbar */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, minWidth: 200 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Rating</InputLabel>
                <Select
                  value={filterRating}
                  label="Rating"
                  onChange={(e) => setFilterRating(e.target.value as any)}
                >
                  <MenuItem value="all">All Ratings</MenuItem>
                  <MenuItem value={5}>5 Stars</MenuItem>
                  <MenuItem value={4}>4 Stars</MenuItem>
                  <MenuItem value={3}>3 Stars</MenuItem>
                  <MenuItem value={2}>2 Stars</MenuItem>
                  <MenuItem value={1}>1 Star</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="highest">Highest Rated</MenuItem>
                  <MenuItem value="lowest">Lowest Rated</MenuItem>
                  <MenuItem value="helpful">Most Helpful</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Reviews List */}
            {filteredReviews.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <StarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No reviews found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your filters
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {filteredReviews.map((review) => (
                  <Paper
                    key={review.id}
                    sx={{
                      p: 3,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                      },
                    }}
                  >
                    {/* Review Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar src={review.customer.avatar} sx={{ width: 56, height: 56 }}>
                          {review.customer.name[0]}
                        </Avatar>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="h6" fontWeight={600}>
                              {review.customer.name}
                            </Typography>
                            {review.customer.verified && (
                              <VerifiedIcon sx={{ fontSize: 18, color: 'success.main' }} />
                            )}
                          </Box>
                          <Rating value={review.rating} size="small" readOnly sx={{ mb: 0.5 }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(review.date)}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setMenuAnchorEl(e.currentTarget);
                          setSelectedReview(review);
                        }}
                      >
                        <MoreIcon />
                      </IconButton>
                    </Box>

                    {/* Review Title */}
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {review.title}
                    </Typography>

                    {/* Review Content */}
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
                      {review.comment}
                    </Typography>

                    {/* Vehicle Info */}
                    {review.vehicleName && (
                      <Chip
                        icon={<CarIcon />}
                        label={review.vehicleName}
                        size="small"
                        onClick={() => navigate(`/cars/${review.vehicleId}`)}
                        sx={{ mb: 2 }}
                      />
                    )}

                    {/* Tags */}
                    {review.tags.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {review.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                    )}

                    {/* Review Footer */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          size="small"
                          startIcon={<ThumbUpIcon />}
                          variant="outlined"
                        >
                          Helpful ({review.helpful})
                        </Button>
                        {!review.reply && (
                          <Button
                            size="small"
                            startIcon={<ReplyIcon />}
                            variant="contained"
                            onClick={() => {
                              setSelectedReview(review);
                              setReplyDialogOpen(true);
                            }}
                            sx={{
                              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            }}
                          >
                            Reply
                          </Button>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {review.reply ? 'Replied' : 'Pending reply'}
                      </Typography>
                    </Box>

                    {/* Dealer Reply */}
                    {review.reply && (
                      <Paper
                        sx={{
                          mt: 2,
                          p: 2,
                          bgcolor: 'primary.light',
                          borderLeft: `4px solid ${theme.palette.primary.main}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Your Reply
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(review.reply.date)}
                          </Typography>
                        </Box>
                        <Typography variant="body2">{review.reply.text}</Typography>
                      </Paper>
                    )}
                  </Paper>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Actions Menu */}
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={() => setMenuAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              if (selectedReview && !selectedReview.reply) {
                setReplyDialogOpen(true);
              }
              setMenuAnchorEl(null);
            }}
            disabled={selectedReview?.reply !== undefined}
          >
            <ReplyIcon sx={{ mr: 1 }} fontSize="small" />
            Reply to Review
          </MenuItem>
          <MenuItem onClick={() => setMenuAnchorEl(null)}>
            <FlagIcon sx={{ mr: 1 }} fontSize="small" />
            Report Review
          </MenuItem>
        </Menu>

        {/* Reply Dialog */}
        <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Reply to Review</DialogTitle>
          <DialogContent>
            {selectedReview && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Avatar src={selectedReview.customer.avatar}>
                    {selectedReview.customer.name[0]}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {selectedReview.customer.name}
                    </Typography>
                    <Rating value={selectedReview.rating} size="small" readOnly />
                  </Box>
                </Box>
                <Paper sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    {selectedReview.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedReview.comment}
                  </Typography>
                </Paper>
              </Box>
            )}
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="Write your reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              startIcon={<ReplyIcon />}
              onClick={handleReply}
              disabled={!replyText.trim()}
            >
              Post Reply
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DealerLayout>
  );
};

export default DealerReviews;

