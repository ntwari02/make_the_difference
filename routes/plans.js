import express from 'express';
import db from '../config/database.js';
import { auth, adminAuth } from '../middleware/auth.js';
const router = express.Router();

// Get all plans
router.get('/', async (req, res) => {
  try {
    const [plans] = await db.promise().query('SELECT * FROM plans');
    res.json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching plans' });
  }
});

// Get single plan
router.get('/:id', async (req, res) => {
  try {
    const [plans] = await db.promise().query(
      'SELECT * FROM plans WHERE id = ?',
      [req.params.id]
    );

    if (plans.length === 0) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json(plans[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching plan' });
  }
});

// Create plan (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, price, description, features } = req.body;

    const [result] = await db.promise().query(
      'INSERT INTO plans (name, price, description, features) VALUES (?, ?, ?, ?)',
      [name, price, description, features]
    );

    res.status(201).json({
      message: 'Plan created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating plan' });
  }
});

// Update plan (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, price, description, features } = req.body;

    const [result] = await db.promise().query(
      'UPDATE plans SET name = ?, price = ?, description = ?, features = ? WHERE id = ?',
      [name, price, description, features, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json({ message: 'Plan updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating plan' });
  }
});

// Delete plan (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const [result] = await db.promise().query(
      'DELETE FROM plans WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting plan' });
  }
});

// Subscribe to a plan
router.post('/:id/subscribe', auth, async (req, res) => {
  try {
    const plan_id = req.params.id;
    const user_id = req.user.id;
    const { start_date, end_date } = req.body;

    // Check if plan exists
    const [plans] = await db.promise().query(
      'SELECT * FROM plans WHERE id = ?',
      [plan_id]
    );

    if (plans.length === 0) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Check if user already has an active subscription
    const [existingSubscriptions] = await db.promise().query(
      'SELECT * FROM plan_subscriptions WHERE user_id = ? AND status = "active"',
      [user_id]
    );

    if (existingSubscriptions.length > 0) {
      return res.status(400).json({ message: 'You already have an active subscription' });
    }

    // Create subscription
    const [result] = await db.promise().query(
      'INSERT INTO plan_subscriptions (user_id, plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, "active")',
      [user_id, plan_id, start_date, end_date]
    );

    res.status(201).json({
      message: 'Subscription created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating subscription' });
  }
});

// Get user's subscriptions
router.get('/subscriptions', auth, async (req, res) => {
  try {
    const [subscriptions] = await db.promise().query(
      `SELECT ps.*, p.name as plan_name, p.price, p.description, p.features 
       FROM plan_subscriptions ps 
       JOIN plans p ON ps.plan_id = p.id 
       WHERE ps.user_id = ?`,
      [req.user.id]
    );

    res.json(subscriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching subscriptions' });
  }
});

// Cancel subscription
router.put('/subscriptions/:id/cancel', auth, async (req, res) => {
  try {
    const [result] = await db.promise().query(
      'UPDATE plan_subscriptions SET status = "cancelled" WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error cancelling subscription' });
  }
});

export default router;