import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserStore, UserRole } from '../models/User';
import { AuthenticatedRequest, JWT_SECRET } from '../middleware/authMiddleware';

// Zod Validation Schemas
const publicRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Must be a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const createResponderSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Must be a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  role: z.enum(['RESCUE_TEAM', 'ADMIN']).default('RESCUE_TEAM'),
});

const loginSchema = z.object({
  email: z.string().email('Must be a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

// Public Self-Registration (Strictly CITIZEN Role Only)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = publicRegisterSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join(', ');
      res.status(400).json({ success: false, message: errorMsg });
      return;
    }

    const { name, email, password } = parseResult.data;

    // Check existing user
    const existingUser = await UserStore.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User with this email already exists.' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Public registration strictly assigns CITIZEN role
    const newUser = await UserStore.createUser({
      name,
      email,
      password: hashedPassword,
      role: 'CITIZEN',
    });

    // Issue JWT Token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Citizen account created successfully.',
      data: {
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });
  } catch (error: any) {
    console.error('[AUTH] Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
};

// Admin Provisioning of Rescue Team / Responder Accounts
export const createRescueTeamAccount = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = createResponderSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join(', ');
      res.status(400).json({ success: false, message: errorMsg });
      return;
    }

    const { name, email, password, role } = parseResult.data;

    const existingUser = await UserStore.findByEmail(email);
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newResponder = await UserStore.createUser({
      name,
      email,
      password: hashedPassword,
      role: role || 'RESCUE_TEAM',
    });

    res.status(201).json({
      success: true,
      message: `Rescue team account (${newResponder.role}) provisioned successfully.`,
      data: {
        id: newResponder._id,
        name: newResponder.name,
        email: newResponder.email,
        role: newResponder.role,
      },
    });
  } catch (error: any) {
    console.error('[AUTH] Provision responder error:', error);
    res.status(500).json({ success: false, message: 'Internal server error creating responder account.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join(', ');
      res.status(400).json({ success: false, message: errorMsg });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await UserStore.findByEmail(email);
    if (!user || !user.password) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    // Issue JWT Token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const user = await UserStore.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User profile not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('[AUTH] GetMe error:', error);
    res.status(500).json({ success: false, message: 'Internal server error fetching user.' });
  }
};
