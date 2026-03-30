// ==================== PHOTOHUB PRO v2.0 - COMPLETE BACKEND ====================
// Features: Cloud Storage, Password Reset, Admin Dashboard, Search, Pricing,
//           Slideshow, Timeline, People Tagging, Instagram Stories,
//           Anniversary Reminders, Free Anniversary Photoshoots

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;
const cron = require('node-cron');
const sharp = require('sharp');

dotenv.config();

// ==================== CONFIGURATION ====================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'secret'
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// ==================== MIDDLEWARE ====================

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.photographerId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT is_admin FROM photographers WHERE id = $1',
      [req.photographerId]
    );
    if (!result.rows[0]?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==================== PHOTOGRAPHER ROUTES ====================

// SIGNUP
app.post('/api/photographers/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO photographers (email, password_hash, name, subscription_tier, created_at)
       VALUES ($1, $2, $3, 'free', NOW())
       RETURNING id, email, name, subscription_tier`,
      [email, hashedPassword, name]
    );

    const token = jwt.sign(
      { id: result.rows[0].id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    res.json({ photographer: result.rows[0], token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN
app.post('/api/photographers/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      'SELECT * FROM photographers WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, result.rows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: result.rows[0].id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    res.json({
      photographer: { id: result.rows[0].id, email: result.rows[0].email, name: result.rows[0].name },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PROFILE
app.get('/api/photographers/profile', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, subscription_tier, is_admin FROM photographers WHERE id = $1',
      [req.photographerId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FORGOT PASSWORD
app.post('/api/photographers/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await pool.query('SELECT id FROM photographers WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Photographer not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await pool.query(
      'UPDATE photographers SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [resetTokenHash, resetTokenExpiry, result.rows[0].id]
    );

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    await transporter.sendMail({
      to: email,
      subject: '🔑 Reset Your PhotoHub Pro Password',
      html: `<h2>Password Reset Request</h2><p><a href="${resetLink}" style="background: #ea580c; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Reset Password</a></p><p>This link expires in 1 hour.</p>`
    });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RESET PASSWORD
app.post('/api/photographers/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const photographers = await pool.query(
      'SELECT * FROM photographers WHERE reset_token_expiry > NOW()'
    );

    let foundPhotographer = null;
    for (let photo of photographers.rows) {
      if (photo.reset_token) {
        const isValid = await bcrypt.compare(token, photo.reset_token);
        if (isValid) {
          foundPhotographer = photo;
          break;
        }
      }
    }

    if (!foundPhotographer) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE photographers SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL WHERE id = $2',
      [hashedPassword, foundPhotographer.id]
    );

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PROJECT ROUTES ====================

app.get('/api/projects', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects WHERE photographer_id = $1 ORDER BY created_at DESC',
      [req.photographerId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', verifyToken, async (req, res) => {
  try {
    const { clientName, eventDate, eventType } = req.body;
    const shareToken = crypto.randomBytes(16).toString('hex');

    const result = await pool.query(
      `INSERT INTO projects (photographer_id, client_name, event_date, event_type, share_token, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [req.photographerId, clientName, eventDate, eventType, shareToken]
    );

    // Create anniversary reminder
    await pool.query(
      `INSERT INTO anniversary_reminders (project_id, event_date)
       VALUES ($1, $2)`,
      [result.rows[0].id, eventDate]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PHOTO ROUTES ====================

app.post('/api/projects/:projectId/photos', verifyToken, async (req, res) => {
  try {
    const { title, imageUrl } = req.body;

    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND photographer_id = $2',
      [req.params.projectId, req.photographerId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const tierCheck = await pool.query(
      'SELECT subscription_tier FROM photographers WHERE id = $1',
      [req.photographerId]
    );

    const limits = { free: 100, starter: 1000, pro: 999999 };
    const photoCount = await pool.query(
      'SELECT COUNT(*) as count FROM photos WHERE photographer_id = $1',
      [req.photographerId]
    );

    if (parseInt(photoCount.rows[0].count) >= limits[tierCheck.rows[0].subscription_tier]) {
      return res.status(403).json({ error: 'Tier limit reached' });
    }

    let cloudinaryUrl = imageUrl;
    if (imageUrl.startsWith('data:')) {
      const uploadResult = await cloudinary.uploader.upload(imageUrl, {
        folder: `photohub/${req.photographerId}/${req.params.projectId}`
      });
      cloudinaryUrl = uploadResult.secure_url;
    }

    const result = await pool.query(
      `INSERT INTO photos (photographer_id, project_id, title, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.photographerId, req.params.projectId, title, cloudinaryUrl]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:projectId/photos', verifyToken, async (req, res) => {
  try {
    const { search, sort, from_date, to_date } = req.query;

    let query = 'SELECT * FROM photos WHERE project_id = $1 AND photographer_id = $2';
    const params = [req.params.projectId, req.photographerId];

    if (search) {
      query += ` AND title ILIKE $${params.length + 1}`;
      params.push(`%${search}%`);
    }

    if (from_date) {
      query += ` AND created_at >= $${params.length + 1}`;
      params.push(from_date);
    }

    if (to_date) {
      query += ` AND created_at <= $${params.length + 1}`;
      params.push(to_date);
    }

    const sortMap = {
      'views': 'views DESC',
      'likes': 'likes DESC',
      'date': 'created_at DESC',
      'name': 'title ASC'
    };

    query += ` ORDER BY ${sortMap[sort] || 'display_order ASC'}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SLIDESHOW ROUTES (FEATURE #1) ====================

app.post('/api/slideshows', verifyToken, async (req, res) => {
  try {
    const { projectId, name, musicStyle } = req.body;

    const project = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND photographer_id = $2',
      [projectId, req.photographerId]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const photos = await pool.query(
      'SELECT id FROM photos WHERE project_id = $1 ORDER BY created_at',
      [projectId]
    );

    const slideshow = await pool.query(
      `INSERT INTO slideshows (project_id, name, music_style, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [projectId, name, musicStyle]
    );

    for (let i = 0; i < photos.rows.length; i++) {
      await pool.query(
        `INSERT INTO slideshow_photos (slideshow_id, photo_id, order_number)
         VALUES ($1, $2, $3)`,
        [slideshow.rows[0].id, photos.rows[i].id, i + 1]
      );
    }

    res.json(slideshow.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/slideshows/:id', verifyToken, async (req, res) => {
  try {
    const slideshow = await pool.query('SELECT * FROM slideshows WHERE id = $1', [req.params.id]);

    if (slideshow.rows.length === 0) {
      return res.status(404).json({ error: 'Slideshow not found' });
    }

    const photos = await pool.query(
      `SELECT p.* FROM photos p
       JOIN slideshow_photos sp ON p.id = sp.photo_id
       WHERE sp.slideshow_id = $1
       ORDER BY sp.order_number`,
      [req.params.id]
    );

    res.json({ slideshow: slideshow.rows[0], photos: photos.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TIMELINE ROUTES (FEATURE #2) ====================

app.post('/api/photos/:photoId/event-label', verifyToken, async (req, res) => {
  try {
    const { eventTimeLabel, eventTimeOrder } = req.body;

    const result = await pool.query(
      `UPDATE photos 
       SET event_time_label = $1, event_time_order = $2
       WHERE id = $3 AND photographer_id = $4
       RETURNING *`,
      [eventTimeLabel, eventTimeOrder, req.params.photoId, req.photographerId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:projectId/timeline', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        event_time_label, 
        event_time_order,
        COUNT(*) as photo_count,
        ARRAY_AGG(id) as photo_ids
       FROM photos 
       WHERE project_id = $1 AND photographer_id = $2 AND event_time_label IS NOT NULL
       GROUP BY event_time_label, event_time_order
       ORDER BY event_time_order`,
      [req.params.projectId, req.photographerId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PEOPLE TAGGING ROUTES (FEATURE #3) ====================

app.post('/api/photos/:photoId/tags', verifyToken, async (req, res) => {
  try {
    const { personName, faceIndex } = req.body;

    const result = await pool.query(
      `INSERT INTO photo_tags (photo_id, person_name, face_index)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.params.photoId, personName, faceIndex]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:projectId/people', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        pt.person_name, 
        COUNT(DISTINCT pt.photo_id) as photo_count
       FROM photo_tags pt
       JOIN photos p ON pt.photo_id = p.id
       WHERE p.project_id = $1 AND p.photographer_id = $2 AND pt.person_name IS NOT NULL
       GROUP BY pt.person_name
       ORDER BY photo_count DESC`,
      [req.params.projectId, req.photographerId]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/projects/:projectId/photos-by-person/:personName', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT p.* FROM photos p
       JOIN photo_tags pt ON p.id = pt.photo_id
       WHERE p.project_id = $1 AND p.photographer_id = $2 AND pt.person_name = $3
       ORDER BY p.created_at`,
      [req.params.projectId, req.photographerId, req.params.personName]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== INSTAGRAM STORY ROUTES (FEATURE #4) ====================

app.post('/api/instagram-stories', verifyToken, async (req, res) => {
  try {
    const { projectId, photoId, templateType, textOverlay, hashtags } = req.body;

    const story = await pool.query(
      `INSERT INTO instagram_stories 
       (project_id, photo_id, template_type, text_overlay, hashtags, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [projectId, photoId, templateType, textOverlay, hashtags]
    );

    res.json(story.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/instagram-stories/:id', verifyToken, async (req, res) => {
  try {
    const story = await pool.query(
      'SELECT * FROM instagram_stories WHERE id = $1',
      [req.params.id]
    );

    res.json(story.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ANNIVERSARY ROUTES (FEATURES #5 & #6) ====================

// Cron job: Send anniversary emails daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const anniversaries = await pool.query(`
      SELECT p.*, ar.id as reminder_id
      FROM projects p
      JOIN anniversary_reminders ar ON p.id = ar.project_id
      WHERE EXTRACT(MONTH FROM ar.event_date) = EXTRACT(MONTH FROM NOW())
      AND EXTRACT(DAY FROM ar.event_date) = EXTRACT(DAY FROM NOW())
      AND (ar.last_reminder_date IS NULL OR ar.last_reminder_date < NOW() - INTERVAL '365 days')
    `);

    for (const project of anniversaries.rows) {
      const photos = await pool.query(
        `SELECT image_url FROM photos 
         WHERE project_id = $1 
         ORDER BY likes DESC, views DESC 
         LIMIT 5`,
        [project.id]
      );

      const emailHtml = `
        <html>
          <body style="font-family: Arial; background: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px;">
              <h1 style="color: #d946ef; text-align: center;">💕 One Year Ago Today!</h1>
              <p>Hi ${project.client_name},</p>
              <p>One year ago, you said "I do!" We wanted to celebrate your anniversary.</p>
              <p style="text-align: center; font-weight: bold; margin: 30px 0;">Here are your favorite moments:</p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0;">
                ${photos.rows.map(p => `<img src="${p.image_url}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;" />`).join('')}
              </div>
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://yourapp.com/claim-photoshoot/${project.id}" style="background: linear-gradient(to right, #ea580c, #f97316); color: white; padding: 15px 40px; text-align: center; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold; font-size: 16px;">
                  ✨ Claim Your Free 2-Hour Anniversary Photoshoot ✨
                </a>
              </p>
              <p style="text-align: center; color: #666; font-size: 14px;">This offer expires in 30 days.</p>
            </div>
          </body>
        </html>
      `;

      try {
        await transporter.sendMail({
          to: project.client_email || 'client@example.com',
          subject: '💕 One Year Ago Today! + Free Anniversary Photoshoot',
          html: emailHtml
        });

        await pool.query(
          `UPDATE anniversary_reminders 
           SET last_reminder_date = NOW(), reminder_sent_count = reminder_sent_count + 1
           WHERE id = $1`,
          [project.reminder_id]
        );

        console.log(`✅ Anniversary email sent for project ${project.id}`);
      } catch (emailError) {
        console.error(`❌ Failed to send anniversary email for ${project.id}:`, emailError);
      }
    }
  } catch (error) {
    console.error('Anniversary cron error:', error);
  }
});

// Claim free photoshoot
app.post('/api/photoshoots/claim-free/:projectId', async (req, res) => {
  try {
    const { preferredDate } = req.body;

    const result = await pool.query(
      `UPDATE anniversary_reminders 
       SET photoshoot_claimed = true, photoshoot_date = $1
       WHERE project_id = $2
       RETURNING *`,
      [preferredDate, req.params.projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Anniversary reminder not found' });
    }

    res.json({ success: true, message: 'Free photoshoot claimed!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get anniversary status
app.get('/api/photoshoots/status/:projectId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM anniversary_reminders WHERE project_id = $1',
      [req.params.projectId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

app.get('/api/admin/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const stats = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM photographers'),
      pool.query('SELECT SUM(amount) as total FROM payments WHERE status = $1', ['paid']),
      pool.query(`SELECT COUNT(*) as count FROM photographers 
                  WHERE created_at > NOW() - INTERVAL '30 days'`)
    ]);

    res.json({
      totalUsers: parseInt(stats[0].rows[0].count) || 0,
      totalRevenue: stats[1].rows[0].total || 0,
      newUsersThisMonth: parseInt(stats[2].rows[0].count) || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/health', (req, res) => {
  res.json({ status: 'OK', version: '2.0' });
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 PhotoHub Pro v2.0 - Complete Photography Platform`);
  console.log(`${'='.repeat(70)}`);
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`\n✨ ALL 6 FEATURES ENABLED:\n`);
  console.log(`  ✅ 1. Slideshow with Music`);
  console.log(`  ✅ 2. Photo Timeline (Event-based)`);
  console.log(`  ✅ 3. Smart People Tagging`);
  console.log(`  ✅ 4. Instagram Story Generator`);
  console.log(`  ✅ 5. Anniversary Reminders (Email)`);
  console.log(`  ✅ 6. Free 2-Hour Anniversary Photoshoots\n`);
  console.log(`+ Original Features:`);
  console.log(`  • Cloud Storage (Cloudinary)`);
  console.log(`  • Password Reset (Email-based)`);
  console.log(`  • Admin Dashboard`);
  console.log(`  • Advanced Search & Filters`);
  console.log(`  • Pricing Tiers (Free/Starter/Pro)\n`);
  console.log(`${'='.repeat(70)}\n`);
});

module.exports = app;
