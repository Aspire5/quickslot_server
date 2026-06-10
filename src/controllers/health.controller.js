export const getHealth = (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
