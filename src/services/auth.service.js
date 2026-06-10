import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

const JWT_SECRET = process.env.TOKEN_SECRET;
const TOKEN_EXPIRY = '7d';

export const login = async (username, password) => {
  if (!username || !password) {
    throw new ApiError(400, 'Username and password are required');
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    throw new ApiError(401, 'Invalid username or password');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new ApiError(401, 'Invalid username or password');
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

  return {
    token,
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
    },
  };
};
