const supabase = require('../services/supabase');
const prisma = require('../services/prisma');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Attach local user data to request
    let localUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!localUser) {
      localUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          displayName: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')?.[0] || 'Chronicle Seeker',
        },
      });
    }

    req.user = { ...user, ...localUser };
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
