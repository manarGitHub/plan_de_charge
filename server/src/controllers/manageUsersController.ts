import { Request, Response } from 'express';
import { Manager, PrismaClient, User } from '@prisma/client';
import { createCognitoUser, deleteCognitoUser, enrichWithCognitoRoles } from '../services/cognitoService';
import { generateTempPassword } from '../utils/helpers';
import { sendCredentialsEmail } from '../services/emailService';

const prisma = new PrismaClient();

// Helper types for type safety
type UserWithEmail = User & { email: string };
type ManagerWithEmail = Manager & { email: string };

export const manageUsersController = {
  createUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, role, name, phoneNumber,username } = req.body;
      const currentUser = req.user!;

      // Authorization check
      if (currentUser.role === 'manager' && role !== 'user') {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      // Validate role input
      if (!['user', 'manager'].includes(role)) {
        res.status(400).json({ error: 'Invalid role specified' });
        return;
      }

        // Validate required fields
      if (!username || !email) {
        res.status(400).json({ error: 'Username and email are required' });
        return;
      }

      // Create Cognito user
      const tempPassword = generateTempPassword();
      const cognitoId = await createCognitoUser(username,email, role, tempPassword);
        console.log('Generated temp password:', tempPassword); // For debugging


      if (!cognitoId) {
        res.status(500).json({ error: 'Failed to create Cognito user' });
        return;
      }

      // Create database entry
      try {
        if (role === 'manager') {
          await prisma.manager.create({
            data: { cognitoId, email, name:username, phoneNumber }
          });
        } else {
          await prisma.user.create({
            data: { cognitoId, email, phoneNumber, username:username }
          });
        }
      } catch (dbError) {
        // Rollback Cognito creation if DB fails
        await deleteCognitoUser(email);
        throw dbError;
      }

         // After successful database creation
        const emailSent = await sendCredentialsEmail({
        to: email,
        username, 
        tempPassword,
        name, 
        role
      });

      res.status(201).json({ 
        message: 'User created successfully' ,
        emailSent,
        username});
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: error.message });
    }
  },

  updateUser: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, phoneNumber } = req.body;
      const currentUser = req.user!;

      if (currentUser.role === 'manager') {
        const user = await prisma.user.findUnique({ 
          where: { userId: Number(id) }
        });

        if (!user) {
          res.status(404).json({ error: 'User not found' });
          return;
        }

        const updatedUser = await prisma.user.update({
          where: { userId: Number(id) },
          data: { phoneNumber }
        });
        res.json(updatedUser);
        return;
      }

      // Handle super admin updates
      const manager = await prisma.manager.findUnique({
        where: { id: Number(id) }
      });

      if (!manager) {
        res.status(404).json({ error: 'Manager not found' });
        return;
      }

      const updatedManager = await prisma.manager.update({
        where: { id: Number(id) },
        data: { name, phoneNumber }
      });

      res.json(updatedManager);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

   deleteUser: async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;
    let targetUser: UserWithEmail | ManagerWithEmail | null = null;

    if (currentUser.role === 'manager') {
      targetUser = await prisma.user.findUnique({
        where: { userId: Number(id) },
        select: { 
          userId: true,
          email: true,
          phoneNumber: true,
          cognitoId: true,
          username: true
        }
      }) as UserWithEmail | null;
    } else {
      // Search both tables for super admin
      targetUser = await prisma.manager.findUnique({
        where: { id: Number(id) },
        select: { 
          id: true,
          email: true,
          name: true,
          phoneNumber: true,
          cognitoId: true
        }
      }) as ManagerWithEmail | null;

      if (!targetUser) {
        targetUser = await prisma.user.findUnique({
          where: { userId: Number(id) },
          select: { 
            userId: true,
            email: true,
            phoneNumber: true,
            cognitoId: true,
            username: true
          }
        }) as UserWithEmail | null;
      }
    }

    // Null check with early return
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Email existence check
    if (!targetUser.email) {
      res.status(400).json({ error: 'User email not found' });
      return;
    }

    // Type-safe deletion
    if ('userId' in targetUser) {
      await prisma.user.delete({ 
        where: { userId: (targetUser as UserWithEmail).userId } 
      });
    } else {
      await prisma.manager.delete({ 
        where: { id: (targetUser as ManagerWithEmail).id } 
      });
    }

    // Cognito deletion
    await deleteCognitoUser(targetUser.email);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
},

 
  getAllUsers: async (req: Request, res: Response): Promise<void> => {
    try {
      const currentUser = req.user!;
      
      let users: User[] = [];
      let managers: Manager[] = [];

      if (currentUser.role === 'super_admin') {
        [users, managers] = await Promise.all([
          prisma.user.findMany(),
          prisma.manager.findMany()
        ]);
      } else if (currentUser.role === 'manager') {
        users = await prisma.user.findMany();
      }

      const [enrichedUsers, enrichedManagers] = await Promise.all([
        enrichWithCognitoRoles(users, 'user'),
        enrichWithCognitoRoles(managers, 'manager')
      ]);

      res.json({ 
        users: enrichedUsers,
        managers: currentUser.role === 'super_admin' ? enrichedManagers : []
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getUserById: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      const user = await prisma.user.findUnique({
        where: { userId: Number(id) },
        include: { team: true }
      });

      if (user) {
        res.json(user);
        return;
      }

      const manager = await prisma.manager.findUnique({
        where: { id: Number(id) }
      });

      if (manager) {
        res.json(manager);
        return;
      }

      res.status(404).json({ error: 'User not found' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};