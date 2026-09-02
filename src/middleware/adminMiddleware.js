const adminMiddleware = (req, res, next) => {
    const adminKey = process.env.ADMIN_KEY;
    const providedKey = req.get('x-admin-key');

    if (!adminKey) {
        return res.status(500).json({
            success: false,
            message: 'Admin access is not configured'
        });
    }

    if (!providedKey || providedKey !== adminKey) {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }

    next();
};

export default adminMiddleware;