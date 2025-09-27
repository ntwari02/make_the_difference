const { executeQuery } = require('../config/database');

class GamificationService {
  constructor() {
    this.achievements = {
      FIRST_APPLICATION: {
        id: 'first_application',
        name: 'First Steps',
        description: 'Applied to your first scholarship',
        points: 50,
        icon: '🎯',
        rarity: 'common'
      },
      APPLIED_5: {
        id: 'applied_5',
        name: 'Dedicated Applicant',
        description: 'Applied to 5 scholarships',
        points: 100,
        icon: '📝',
        rarity: 'common'
      },
      APPLIED_10: {
        id: 'applied_10',
        name: 'Scholarship Hunter',
        description: 'Applied to 10 scholarships',
        points: 200,
        icon: '🏹',
        rarity: 'uncommon'
      },
      APPLIED_25: {
        id: 'applied_25',
        name: 'Application Master',
        description: 'Applied to 25 scholarships',
        points: 500,
        icon: '👑',
        rarity: 'rare'
      },
      FIRST_ACCEPTANCE: {
        id: 'first_acceptance',
        name: 'Winner!',
        description: 'Received your first scholarship',
        points: 1000,
        icon: '🏆',
        rarity: 'epic'
      },
      PERFECT_MATCH: {
        id: 'perfect_match',
        name: 'Perfect Match',
        description: 'Applied to a 100% match scholarship',
        points: 150,
        icon: '💎',
        rarity: 'uncommon'
      },
      EARLY_BIRD: {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Applied 30+ days before deadline',
        points: 75,
        icon: '🐦',
        rarity: 'common'
      },
      DOCUMENT_MASTER: {
        id: 'document_master',
        name: 'Document Master',
        description: 'Uploaded all required documents',
        points: 100,
        icon: '📄',
        rarity: 'common'
      },
      PROFILE_COMPLETE: {
        id: 'profile_complete',
        name: 'Profile Perfectionist',
        description: 'Completed 100% of your profile',
        points: 200,
        icon: '✨',
        rarity: 'uncommon'
      },
      SCHOLARSHIP_GURU: {
        id: 'scholarship_guru',
        name: 'Scholarship Guru',
        description: 'Helped 5 other students with applications',
        points: 300,
        icon: '🧙‍♂️',
        rarity: 'rare'
      }
    };

    this.levels = [
      { level: 1, name: 'Beginner', minPoints: 0, color: '#8B5CF6' },
      { level: 2, name: 'Explorer', minPoints: 100, color: '#06B6D4' },
      { level: 3, name: 'Seeker', minPoints: 300, color: '#10B981' },
      { level: 4, name: 'Hunter', minPoints: 600, color: '#F59E0B' },
      { level: 5, name: 'Master', minPoints: 1000, color: '#EF4444' },
      { level: 6, name: 'Legend', minPoints: 2000, color: '#8B5CF6' },
      { level: 7, name: 'Champion', minPoints: 3500, color: '#F59E0B' },
      { level: 8, name: 'Elite', minPoints: 5000, color: '#EF4444' },
      { level: 9, name: 'Grandmaster', minPoints: 7500, color: '#8B5CF6' },
      { level: 10, name: 'Supreme', minPoints: 10000, color: '#F59E0B' }
    ];
  }

  // Award points to user
  async awardPoints(userId, points, reason, metadata = {}) {
    try {
      // Update user points
      const updateQuery = `
        UPDATE users 
        SET points = COALESCE(points, 0) + ?
        WHERE id = ?
      `;
      
      await executeQuery(updateQuery, [points, userId]);

      // Log the points transaction
      const logQuery = `
        INSERT INTO user_points_log (user_id, points, reason, metadata, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `;
      
      await executeQuery(logQuery, [userId, points, reason, JSON.stringify(metadata)]);

      // Check for level up
      const newLevel = await this.checkLevelUp(userId);
      
      return {
        pointsAwarded: points,
        reason,
        newLevel,
        totalPoints: await this.getUserPoints(userId)
      };
    } catch (error) {
      console.error('Error awarding points:', error);
      throw new Error('Failed to award points');
    }
  }

  // Check and award achievements
  async checkAchievements(userId) {
    try {
      const userStats = await this.getUserStats(userId);
      const userAchievements = await this.getUserAchievements(userId);
      const newAchievements = [];

      // Check each achievement
      for (const [key, achievement] of Object.entries(this.achievements)) {
        if (userAchievements.includes(achievement.id)) {
          continue; // Already earned
        }

        let earned = false;
        let metadata = {};

        switch (key) {
          case 'FIRST_APPLICATION':
            earned = userStats.total_applications >= 1;
            break;
          case 'APPLIED_5':
            earned = userStats.total_applications >= 5;
            break;
          case 'APPLIED_10':
            earned = userStats.total_applications >= 10;
            break;
          case 'APPLIED_25':
            earned = userStats.total_applications >= 25;
            break;
          case 'FIRST_ACCEPTANCE':
            earned = userStats.accepted_applications >= 1;
            break;
          case 'PERFECT_MATCH':
            // Check if user applied to any 100% match scholarship
            earned = await this.hasPerfectMatch(userId);
            break;
          case 'EARLY_BIRD':
            // Check if user applied early to any scholarship
            earned = await this.hasEarlyApplication(userId);
            break;
          case 'DOCUMENT_MASTER':
            // Check if user has uploaded all documents for any application
            earned = await this.hasCompleteDocuments(userId);
            break;
          case 'PROFILE_COMPLETE':
            earned = await this.isProfileComplete(userId);
            break;
          case 'SCHOLARSHIP_GURU':
            earned = userStats.helpful_actions >= 5;
            break;
        }

        if (earned) {
          await this.awardAchievement(userId, achievement.id, metadata);
          newAchievements.push(achievement);
        }
      }

      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw new Error('Failed to check achievements');
    }
  }

  // Award achievement to user
  async awardAchievement(userId, achievementId, metadata = {}) {
    try {
      const achievement = Object.values(this.achievements).find(a => a.id === achievementId);
      if (!achievement) {
        throw new Error('Achievement not found');
      }

      // Insert achievement record
      const query = `
        INSERT INTO user_achievements (user_id, achievement_id, earned_at, metadata)
        VALUES (?, ?, NOW(), ?)
      `;
      
      await executeQuery(query, [userId, achievementId, JSON.stringify(metadata)]);

      // Award points for achievement
      await this.awardPoints(userId, achievement.points, `Achievement: ${achievement.name}`, {
        achievement_id: achievementId,
        ...metadata
      });

      return achievement;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      throw new Error('Failed to award achievement');
    }
  }

  // Check for level up
  async checkLevelUp(userId) {
    try {
      const userPoints = await this.getUserPoints(userId);
      const currentLevel = await this.getUserLevel(userId);
      
      // Find the highest level the user qualifies for
      let newLevel = currentLevel;
      for (const level of this.levels) {
        if (userPoints >= level.minPoints) {
          newLevel = level.level;
        } else {
          break;
        }
      }

      // If level increased, log it
      if (newLevel > currentLevel) {
        const levelData = this.levels.find(l => l.level === newLevel);
        await this.logLevelUp(userId, currentLevel, newLevel, levelData);
      }

      return newLevel;
    } catch (error) {
      console.error('Error checking level up:', error);
      return 1;
    }
  }

  // Get user statistics
  async getUserStats(userId) {
    try {
      const query = `
        SELECT 
          COUNT(sa.id) as total_applications,
          COUNT(CASE WHEN sa.status = 'accepted' THEN 1 END) as accepted_applications,
          COUNT(CASE WHEN sa.status = 'rejected' THEN 1 END) as rejected_applications,
          COUNT(CASE WHEN sa.status = 'under_review' THEN 1 END) as pending_applications,
          COUNT(CASE WHEN sa.submitted_at > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as recent_applications,
          COALESCE(u.points, 0) as total_points,
          COALESCE(u.helpful_actions, 0) as helpful_actions
        FROM users u
        LEFT JOIN scholarship_applications sa ON u.id = sa.user_id
        WHERE u.id = ?
        GROUP BY u.id
      `;

      const result = await executeQuery(query, [userId]);
      return result[0] || {
        total_applications: 0,
        accepted_applications: 0,
        rejected_applications: 0,
        pending_applications: 0,
        recent_applications: 0,
        total_points: 0,
        helpful_actions: 0
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw new Error('Failed to get user statistics');
    }
  }

  // Get user achievements
  async getUserAchievements(userId) {
    try {
      const query = `
        SELECT achievement_id 
        FROM user_achievements 
        WHERE user_id = ?
      `;

      const result = await executeQuery(query, [userId]);
      return result.map(row => row.achievement_id);
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  // Get user points
  async getUserPoints(userId) {
    try {
      const query = `SELECT COALESCE(points, 0) as points FROM users WHERE id = ?`;
      const result = await executeQuery(query, [userId]);
      return result[0]?.points || 0;
    } catch (error) {
      console.error('Error getting user points:', error);
      return 0;
    }
  }

  // Get user level
  async getUserLevel(userId) {
    try {
      const userPoints = await this.getUserPoints(userId);
      let level = 1;
      
      for (const levelData of this.levels) {
        if (userPoints >= levelData.minPoints) {
          level = levelData.level;
        } else {
          break;
        }
      }
      
      return level;
    } catch (error) {
      console.error('Error getting user level:', error);
      return 1;
    }
  }

  // Get leaderboard
  async getLeaderboard(limit = 10, timeframe = 'all') {
    try {
      let dateFilter = '';
      if (timeframe === 'month') {
        dateFilter = 'AND u.created_at > DATE_SUB(NOW(), INTERVAL 1 MONTH)';
      } else if (timeframe === 'week') {
        dateFilter = 'AND u.created_at > DATE_SUB(NOW(), INTERVAL 1 WEEK)';
      }

      const query = `
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.profile_image,
          COALESCE(u.points, 0) as points,
          COUNT(sa.id) as applications,
          COUNT(CASE WHEN sa.status = 'accepted' THEN 1 END) as scholarships_won
        FROM users u
        LEFT JOIN scholarship_applications sa ON u.id = sa.user_id
        WHERE u.role = 'student' ${dateFilter}
        GROUP BY u.id
        ORDER BY points DESC, scholarships_won DESC, applications DESC
        LIMIT ?
      `;

      const leaderboard = await executeQuery(query, [limit]);
      
      return leaderboard.map((user, index) => ({
        ...user,
        rank: index + 1,
        level: this.getLevelFromPoints(user.points)
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw new Error('Failed to get leaderboard');
    }
  }

  // Get level from points
  getLevelFromPoints(points) {
    let level = 1;
    for (const levelData of this.levels) {
      if (points >= levelData.minPoints) {
        level = levelData.level;
      } else {
        break;
      }
    }
    return level;
  }

  // Log level up
  async logLevelUp(userId, oldLevel, newLevel, levelData) {
    try {
      const query = `
        INSERT INTO user_level_logs (user_id, old_level, new_level, level_data, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `;
      
      await executeQuery(query, [userId, oldLevel, newLevel, JSON.stringify(levelData)]);
    } catch (error) {
      console.error('Error logging level up:', error);
    }
  }

  // Helper methods for achievement checks
  async hasPerfectMatch(userId) {
    // This would check if user applied to any 100% match scholarship
    // Implementation depends on your matching system
    return false;
  }

  async hasEarlyApplication(userId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM scholarship_applications sa
        JOIN scholarships s ON sa.scholarship_id = s.id
        WHERE sa.user_id = ? 
        AND sa.submitted_at < DATE_SUB(s.application_deadline, INTERVAL 30 DAY)
      `;
      
      const result = await executeQuery(query, [userId]);
      return result[0].count > 0;
    } catch (error) {
      return false;
    }
  }

  async hasCompleteDocuments(userId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM scholarship_applications sa
        WHERE sa.user_id = ? 
        AND JSON_LENGTH(sa.documents) = (
          SELECT JSON_LENGTH(s.required_documents)
          FROM scholarships s
          WHERE s.id = sa.scholarship_id
        )
      `;
      
      const result = await executeQuery(query, [userId]);
      return result[0].count > 0;
    } catch (error) {
      return false;
    }
  }

  async isProfileComplete(userId) {
    try {
      const query = `
        SELECT 
          CASE WHEN 
            first_name IS NOT NULL AND first_name != '' AND
            last_name IS NOT NULL AND last_name != '' AND
            email IS NOT NULL AND email != '' AND
            date_of_birth IS NOT NULL AND
            nationality IS NOT NULL AND nationality != '' AND
            education IS NOT NULL AND education != '{}' AND
            skills IS NOT NULL AND skills != '[]'
          THEN 1 ELSE 0 END as is_complete
        FROM users 
        WHERE id = ?
      `;
      
      const result = await executeQuery(query, [userId]);
      return result[0]?.is_complete === 1;
    } catch (error) {
      return false;
    }
  }

  // Get user dashboard data
  async getUserDashboard(userId) {
    try {
      const [stats, achievements, level, leaderboardPosition] = await Promise.all([
        this.getUserStats(userId),
        this.getUserAchievements(userId),
        this.getUserLevel(userId),
        this.getUserLeaderboardPosition(userId)
      ]);

      const levelData = this.levels.find(l => l.level === level);
      const nextLevel = this.levels.find(l => l.level === level + 1);
      
      return {
        stats,
        level: {
          current: level,
          name: levelData?.name || 'Beginner',
          color: levelData?.color || '#8B5CF6',
          points: stats.total_points,
          nextLevel: nextLevel ? {
            level: nextLevel.level,
            name: nextLevel.name,
            pointsNeeded: nextLevel.minPoints - stats.total_points
          } : null
        },
        achievements: achievements.map(id => this.achievements[Object.keys(this.achievements).find(key => this.achievements[key].id === id)]),
        leaderboardPosition,
        recentActivity: await this.getRecentActivity(userId)
      };
    } catch (error) {
      console.error('Error getting user dashboard:', error);
      throw new Error('Failed to get user dashboard');
    }
  }

  // Get user's leaderboard position
  async getUserLeaderboardPosition(userId) {
    try {
      const query = `
        SELECT position FROM (
          SELECT 
            u.id,
            ROW_NUMBER() OVER (ORDER BY COALESCE(u.points, 0) DESC) as position
          FROM users u
          WHERE u.role = 'student'
        ) ranked
        WHERE id = ?
      `;
      
      const result = await executeQuery(query, [userId]);
      return result[0]?.position || null;
    } catch (error) {
      return null;
    }
  }

  // Get recent activity
  async getRecentActivity(userId, limit = 10) {
    try {
      const query = `
        SELECT 
          'points' as type,
          points as value,
          reason,
          created_at
        FROM user_points_log
        WHERE user_id = ?
        
        UNION ALL
        
        SELECT 
          'achievement' as type,
          a.points as value,
          CONCAT('Achievement: ', a.name) as reason,
          ua.earned_at as created_at
        FROM user_achievements ua
        JOIN (
          SELECT 'first_application' as id, 'First Steps' as name, 50 as points
          UNION SELECT 'applied_5', 'Dedicated Applicant', 100
          UNION SELECT 'applied_10', 'Scholarship Hunter', 200
          UNION SELECT 'applied_25', 'Application Master', 500
          UNION SELECT 'first_acceptance', 'Winner!', 1000
        ) a ON ua.achievement_id = a.id
        WHERE ua.user_id = ?
        
        ORDER BY created_at DESC
        LIMIT ?
      `;
      
      const activity = await executeQuery(query, [userId, userId, limit]);
      return activity;
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }
}

module.exports = new GamificationService();
