import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '@/controllers/AuthController';
import { ValidationMiddleware } from '@/middleware/ValidationMiddleware';
import { AuthMiddleware } from '@/middleware/AuthMiddleware';

export class AuthRoutes {
  private router: Router;
  private authController: AuthController;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Login route
    this.router.post(
      '/login',
      [
        body('email')
          .isEmail()
          .normalizeEmail()
          .withMessage('Please provide a valid email'),
        body('password')
          .isLength({ min: 6 })
          .withMessage('Password must be at least 6 characters long'),
      ],
      ValidationMiddleware.validate,
      ValidationMiddleware.sanitizeInput,
      this.authController.login.bind(this.authController)
    );

    // Register (creates user + workspace)
    this.router.post(
      '/register',
      [
        body('email')
          .isEmail()
          .normalizeEmail()
          .withMessage('Please provide a valid email'),
        body('username')
          .isLength({ min: 3, max: 20 })
          .matches(/^[a-zA-Z0-9_]+$/)
          .withMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores'),
        body('password')
          .isLength({ min: 8 })
          .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
          .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
        body('firstName')
          .trim()
          .isLength({ min: 1, max: 50 })
          .withMessage('First name is required and must be less than 50 characters'),
        body('lastName')
          .trim()
          .isLength({ min: 1, max: 50 })
          .withMessage('Last name is required and must be less than 50 characters'),
        body('organizationName')
          .optional()
          .trim()
          .isLength({ min: 1, max: 100 })
          .withMessage('Organization name must be less than 100 characters'),
      ],
      ValidationMiddleware.validate,
      ValidationMiddleware.sanitizeInput,
      this.authController.register.bind(this.authController)
    );

    // Accept invitation and join workspace
    this.router.post(
      '/accept-invitation',
      [
        body('token')
          .notEmpty()
          .withMessage('Invitation token is required'),
        body('username')
          .optional()
          .isLength({ min: 3, max: 20 })
          .matches(/^[a-zA-Z0-9_]+$/)
          .withMessage('Username must be 3-20 characters and contain only letters, numbers, and underscores'),
        body('password')
          .optional()
          .isLength({ min: 8 })
          .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
          .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
        body('firstName')
          .optional()
          .trim()
          .isLength({ min: 1, max: 50 })
          .withMessage('First name is required and must be less than 50 characters'),
        body('lastName')
          .optional()
          .trim()
          .isLength({ min: 1, max: 50 })
          .withMessage('Last name is required and must be less than 50 characters'),
      ],
      ValidationMiddleware.validate,
      ValidationMiddleware.sanitizeInput,
      this.authController.acceptInvitation.bind(this.authController)
    );

    // Verify invitation token
    this.router.get(
      '/invite/verify/:token',
      this.authController.verifyInvitation.bind(this.authController)
    );

    // Refresh token route
    this.router.post(
      '/refresh',
      [
        body('refreshToken')
          .notEmpty()
          .withMessage('Refresh token is required'),
      ],
      ValidationMiddleware.validate,
      this.authController.refreshToken.bind(this.authController)
    );

    // Logout route
    this.router.post(
      '/logout',
      AuthMiddleware.authenticate,
      this.authController.logout.bind(this.authController)
    );

    // Change password route
    this.router.post(
      '/change-password',
      [
        body('currentPassword')
          .notEmpty()
          .withMessage('Current password is required'),
        body('newPassword')
          .isLength({ min: 8 })
          .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
          .withMessage('New password must be at least 8 characters with uppercase, lowercase, number, and special character'),
      ],
      ValidationMiddleware.validate,
      AuthMiddleware.authenticate,
      this.authController.changePassword.bind(this.authController)
    );

    // Get current user profile
    this.router.get(
      '/profile',
      AuthMiddleware.authenticate,
      this.authController.getProfile.bind(this.authController)
    );

    // Update profile
    this.router.put(
      '/profile',
      [
        body('firstName')
          .optional()
          .trim()
          .isLength({ min: 1, max: 50 })
          .withMessage('First name must be less than 50 characters'),
        body('lastName')
          .optional()
          .trim()
          .isLength({ min: 1, max: 50 })
          .withMessage('Last name must be less than 50 characters'),
        body('email')
          .optional()
          .isEmail()
          .normalizeEmail()
          .withMessage('Please provide a valid email'),
      ],
      ValidationMiddleware.validate,
      ValidationMiddleware.sanitizeInput,
      AuthMiddleware.authenticate,
      this.authController.updateProfile.bind(this.authController)
    );

    // Verify token route
    this.router.get(
      '/verify',
      AuthMiddleware.authenticate,
      this.authController.verifyToken.bind(this.authController)
    );

    // Forgot password
    this.router.post(
      '/forgot-password',
      [
        body('email')
          .isEmail()
          .normalizeEmail()
          .withMessage('Please provide a valid email'),
      ],
      ValidationMiddleware.validate,
      this.authController.forgotPassword.bind(this.authController)
    );

    // Reset password
    this.router.post(
      '/reset-password',
      [
        body('token')
          .notEmpty()
          .withMessage('Reset token is required'),
        body('newPassword')
          .isLength({ min: 8 })
          .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
          .withMessage('New password must be at least 8 characters with uppercase, lowercase, number, and special character'),
      ],
      ValidationMiddleware.validate,
      this.authController.resetPassword.bind(this.authController)
    );

    // Verify reset token
    this.router.get(
      '/reset-password/verify/:token',
      this.authController.verifyResetToken.bind(this.authController)
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
