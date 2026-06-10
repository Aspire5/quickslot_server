import { login } from '../services/auth.service.js';

export const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const data = await login(username, password);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
