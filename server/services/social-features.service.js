const { executeQuery } = require('../config/database');

class SocialFeaturesService {
  constructor() {
    this.postTypes = {
      SCHOLARSHIP_TIP: 'scholarship_tip',
      SUCCESS_STORY: 'success_story',
      QUESTION: 'question',
      RESOURCE: 'resource',
      CELEBRATION: 'celebration'
    };
  }

  // Create a post
  async createPost(userId, postData) {
    try {
      const {
        type,
        title,
        content,
        tags = [],
        is_anonymous = false,
        scholarship_id = null,
        attachments = []
      } = postData;

      const query = `
        INSERT INTO community_posts (
          user_id, type, title, content, tags, is_anonymous, 
          scholarship_id, attachments, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;

      const result = await executeQuery(query, [
        userId,
        type,
        title,
        content,
        JSON.stringify(tags),
        is_anonymous,
        scholarship_id,
        JSON.stringify(attachments)
      ]);

      // Award points for creating post
      const gamificationService = require('./gamification.service');
      await gamificationService.awardPoints(userId, 10, 'Created community post', {
        post_id: result.insertId,
        type
      });

      return result.insertId;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post');
    }
  }

  // Get community posts with filters
  async getPosts(filters = {}) {
    try {
      let query = `
        SELECT 
          cp.*,
          u.first_name,
          u.last_name,
          u.profile_image,
          u.nationality,
          COUNT(cl.id) as likes_count,
          COUNT(cc.id) as comments_count,
          s.title as scholarship_title
        FROM community_posts cp
        LEFT JOIN users u ON cp.user_id = u.id
        LEFT JOIN community_likes cl ON cp.id = cl.post_id
        LEFT JOIN community_comments cc ON cp.id = cc.post_id
        LEFT JOIN scholarships s ON cp.scholarship_id = s.id
        WHERE cp.status = 'active'
      `;

      const params = [];
      const conditions = [];

      if (filters.type) {
        conditions.push('cp.type = ?');
        params.push(filters.type);
      }

      if (filters.user_id) {
        conditions.push('cp.user_id = ?');
        params.push(filters.user_id);
      }

      if (filters.scholarship_id) {
        conditions.push('cp.scholarship_id = ?');
        params.push(filters.scholarship_id);
      }

      if (filters.tags && filters.tags.length > 0) {
        conditions.push('JSON_OVERLAPS(cp.tags, ?)');
        params.push(JSON.stringify(filters.tags));
      }

      if (filters.search) {
        conditions.push('(cp.title LIKE ? OR cp.content LIKE ?)');
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      if (conditions.length > 0) {
        query += ' AND ' + conditions.join(' AND ');
      }

      query += ' GROUP BY cp.id';

      // Add sorting
      if (filters.sort_by === 'trending') {
        query += ' ORDER BY (likes_count + comments_count) DESC, cp.created_at DESC';
      } else if (filters.sort_by === 'recent') {
        query += ' ORDER BY cp.created_at DESC';
      } else if (filters.sort_by === 'popular') {
        query += ' ORDER BY likes_count DESC, cp.created_at DESC';
      } else {
        query += ' ORDER BY cp.created_at DESC';
      }

      // Add pagination
      if (filters.limit) {
        query += ' LIMIT ?';
        params.push(filters.limit);
        
        if (filters.offset) {
          query += ' OFFSET ?';
          params.push(filters.offset);
        }
      }

      const posts = await executeQuery(query, params);
      
      return posts.map(post => ({
        ...post,
        tags: JSON.parse(post.tags || '[]'),
        attachments: JSON.parse(post.attachments || '[]')
      }));
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new Error('Failed to fetch posts');
    }
  }

  // Like a post
  async likePost(userId, postId) {
    try {
      // Check if already liked
      const existingLike = await executeQuery(
        'SELECT id FROM community_likes WHERE user_id = ? AND post_id = ?',
        [userId, postId]
      );

      if (existingLike.length > 0) {
        // Unlike
        await executeQuery(
          'DELETE FROM community_likes WHERE user_id = ? AND post_id = ?',
          [userId, postId]
        );
        return { liked: false };
      } else {
        // Like
        await executeQuery(
          'INSERT INTO community_likes (user_id, post_id, created_at) VALUES (?, ?, NOW())',
          [userId, postId]
        );

        // Award points for helpful interaction
        const gamificationService = require('./gamification.service');
        await gamificationService.awardPoints(userId, 2, 'Liked community post', {
          post_id: postId
        });

        return { liked: true };
      }
    } catch (error) {
      console.error('Error liking post:', error);
      throw new Error('Failed to like post');
    }
  }

  // Comment on a post
  async addComment(userId, postId, content, parentId = null) {
    try {
      const query = `
        INSERT INTO community_comments (
          user_id, post_id, content, parent_id, created_at
        ) VALUES (?, ?, ?, ?, NOW())
      `;

      const result = await executeQuery(query, [userId, postId, content, parentId]);

      // Award points for helpful interaction
      const gamificationService = require('./gamification.service');
      await gamificationService.awardPoints(userId, 5, 'Commented on community post', {
        post_id: postId,
        comment_id: result.insertId
      });

      return result.insertId;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  }

  // Get comments for a post
  async getComments(postId, limit = 20) {
    try {
      const query = `
        SELECT 
          cc.*,
          u.first_name,
          u.last_name,
          u.profile_image,
          COUNT(cl.id) as likes_count
        FROM community_comments cc
        LEFT JOIN users u ON cc.user_id = u.id
        LEFT JOIN comment_likes cl ON cc.id = cl.comment_id
        WHERE cc.post_id = ? AND cc.status = 'active'
        GROUP BY cc.id
        ORDER BY cc.created_at ASC
        LIMIT ?
      `;

      const comments = await executeQuery(query, [postId, limit]);
      return comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw new Error('Failed to fetch comments');
    }
  }

  // Follow a user
  async followUser(followerId, followingId) {
    try {
      if (followerId === followingId) {
        throw new Error('Cannot follow yourself');
      }

      // Check if already following
      const existingFollow = await executeQuery(
        'SELECT id FROM user_follows WHERE follower_id = ? AND following_id = ?',
        [followerId, followingId]
      );

      if (existingFollow.length > 0) {
        // Unfollow
        await executeQuery(
          'DELETE FROM user_follows WHERE follower_id = ? AND following_id = ?',
          [followerId, followingId]
        );
        return { following: false };
      } else {
        // Follow
        await executeQuery(
          'INSERT INTO user_follows (follower_id, following_id, created_at) VALUES (?, ?, NOW())',
          [followerId, followingId]
        );

        // Award points for social interaction
        const gamificationService = require('./gamification.service');
        await gamificationService.awardPoints(followerId, 3, 'Followed user', {
          following_id: followingId
        });

        return { following: true };
      }
    } catch (error) {
      console.error('Error following user:', error);
      throw new Error('Failed to follow user');
    }
  }

  // Get user's feed
  async getUserFeed(userId, limit = 20) {
    try {
      const query = `
        SELECT 
          cp.*,
          u.first_name,
          u.last_name,
          u.profile_image,
          u.nationality,
          COUNT(cl.id) as likes_count,
          COUNT(cc.id) as comments_count,
          s.title as scholarship_title,
          CASE WHEN cl2.id IS NOT NULL THEN 1 ELSE 0 END as user_liked
        FROM community_posts cp
        LEFT JOIN users u ON cp.user_id = u.id
        LEFT JOIN community_likes cl ON cp.id = cl.post_id
        LEFT JOIN community_comments cc ON cp.id = cc.post_id
        LEFT JOIN scholarships s ON cp.scholarship_id = s.id
        LEFT JOIN community_likes cl2 ON cp.id = cl2.post_id AND cl2.user_id = ?
        WHERE cp.status = 'active'
        AND (
          cp.user_id IN (
            SELECT following_id FROM user_follows WHERE follower_id = ?
          )
          OR cp.user_id = ?
          OR cp.type IN ('success_story', 'scholarship_tip')
        )
        GROUP BY cp.id
        ORDER BY cp.created_at DESC
        LIMIT ?
      `;

      const posts = await executeQuery(query, [userId, userId, userId, limit]);
      
      return posts.map(post => ({
        ...post,
        tags: JSON.parse(post.tags || '[]'),
        attachments: JSON.parse(post.attachments || '[]')
      }));
    } catch (error) {
      console.error('Error fetching user feed:', error);
      throw new Error('Failed to fetch user feed');
    }
  }

  // Get user's followers/following
  async getUserConnections(userId, type = 'followers') {
    try {
      const field = type === 'followers' ? 'follower_id' : 'following_id';
      const joinField = type === 'followers' ? 'following_id' : 'follower_id';

      const query = `
        SELECT 
          uf.*,
          u.first_name,
          u.last_name,
          u.profile_image,
          u.nationality,
          u.bio,
          COUNT(sa.id) as applications_count,
          COUNT(CASE WHEN sa.status = 'accepted' THEN 1 END) as scholarships_won
        FROM user_follows uf
        JOIN users u ON uf.${joinField} = u.id
        LEFT JOIN scholarship_applications sa ON u.id = sa.user_id
        WHERE uf.${field} = ?
        GROUP BY u.id
        ORDER BY uf.created_at DESC
      `;

      const connections = await executeQuery(query, [userId]);
      return connections;
    } catch (error) {
      console.error('Error fetching user connections:', error);
      throw new Error('Failed to fetch user connections');
    }
  }

  // Get trending topics
  async getTrendingTopics(limit = 10) {
    try {
      const query = `
        SELECT 
          tag,
          COUNT(*) as post_count,
          COUNT(DISTINCT user_id) as unique_users
        FROM community_posts,
        JSON_TABLE(tags, '$[*]' COLUMNS (tag VARCHAR(100) PATH '$')) as jt
        WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
        AND status = 'active'
        GROUP BY tag
        ORDER BY post_count DESC, unique_users DESC
        LIMIT ?
      `;

      const topics = await executeQuery(query, [limit]);
      return topics;
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      throw new Error('Failed to fetch trending topics');
    }
  }

  // Get success stories
  async getSuccessStories(limit = 10) {
    try {
      const query = `
        SELECT 
          cp.*,
          u.first_name,
          u.last_name,
          u.profile_image,
          u.nationality,
          s.title as scholarship_title,
          s.provider_name,
          s.country,
          COUNT(cl.id) as likes_count,
          COUNT(cc.id) as comments_count
        FROM community_posts cp
        LEFT JOIN users u ON cp.user_id = u.id
        LEFT JOIN scholarships s ON cp.scholarship_id = s.id
        LEFT JOIN community_likes cl ON cp.id = cl.post_id
        LEFT JOIN community_comments cc ON cp.id = cc.post_id
        WHERE cp.type = 'success_story'
        AND cp.status = 'active'
        GROUP BY cp.id
        ORDER BY likes_count DESC, cp.created_at DESC
        LIMIT ?
      `;

      const stories = await executeQuery(query, [limit]);
      
      return stories.map(story => ({
        ...story,
        tags: JSON.parse(story.tags || '[]'),
        attachments: JSON.parse(story.attachments || '[]')
      }));
    } catch (error) {
      console.error('Error fetching success stories:', error);
      throw new Error('Failed to fetch success stories');
    }
  }

  // Get scholarship discussions
  async getScholarshipDiscussions(scholarshipId, limit = 20) {
    try {
      const query = `
        SELECT 
          cp.*,
          u.first_name,
          u.last_name,
          u.profile_image,
          u.nationality,
          COUNT(cl.id) as likes_count,
          COUNT(cc.id) as comments_count
        FROM community_posts cp
        LEFT JOIN users u ON cp.user_id = u.id
        LEFT JOIN community_likes cl ON cp.id = cl.post_id
        LEFT JOIN community_comments cc ON cp.id = cc.post_id
        WHERE cp.scholarship_id = ?
        AND cp.status = 'active'
        GROUP BY cp.id
        ORDER BY cp.created_at DESC
        LIMIT ?
      `;

      const discussions = await executeQuery(query, [scholarshipId, limit]);
      
      return discussions.map(discussion => ({
        ...discussion,
        tags: JSON.parse(discussion.tags || '[]'),
        attachments: JSON.parse(discussion.attachments || '[]')
      }));
    } catch (error) {
      console.error('Error fetching scholarship discussions:', error);
      throw new Error('Failed to fetch scholarship discussions');
    }
  }

  // Report inappropriate content
  async reportContent(userId, contentType, contentId, reason, description = '') {
    try {
      const query = `
        INSERT INTO content_reports (
          user_id, content_type, content_id, reason, description, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `;

      const result = await executeQuery(query, [userId, contentType, contentId, reason, description]);
      return result.insertId;
    } catch (error) {
      console.error('Error reporting content:', error);
      throw new Error('Failed to report content');
    }
  }

  // Get user's activity summary
  async getUserActivitySummary(userId) {
    try {
      const query = `
        SELECT 
          COUNT(DISTINCT cp.id) as posts_created,
          COUNT(DISTINCT cl.id) as posts_liked,
          COUNT(DISTINCT cc.id) as comments_made,
          COUNT(DISTINCT uf.following_id) as following_count,
          COUNT(DISTINCT uf2.follower_id) as followers_count
        FROM users u
        LEFT JOIN community_posts cp ON u.id = cp.user_id
        LEFT JOIN community_likes cl ON u.id = cl.user_id
        LEFT JOIN community_comments cc ON u.id = cc.user_id
        LEFT JOIN user_follows uf ON u.id = uf.follower_id
        LEFT JOIN user_follows uf2 ON u.id = uf2.following_id
        WHERE u.id = ?
      `;

      const summary = await executeQuery(query, [userId]);
      return summary[0];
    } catch (error) {
      console.error('Error getting user activity summary:', error);
      throw new Error('Failed to get user activity summary');
    }
  }
}

module.exports = new SocialFeaturesService();
