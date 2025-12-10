import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    // Configuration pour Mailtrap (tests locaux) ou SMTP réel (production)
    const isDevelopment = this.configService.get<string>('NODE_ENV') !== 'production';
    
    if (isDevelopment) {
      // Configuration Mailtrap pour les tests locaux
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('MAILTRAP_HOST', 'sandbox.smtp.mailtrap.io'),
        port: parseInt(this.configService.get<string>('MAILTRAP_PORT', '2525')),
        auth: {
          user: this.configService.get<string>('MAILTRAP_USER'),
          pass: this.configService.get<string>('MAILTRAP_PASS'),
        },
      });
    } else {
      // Configuration SMTP pour la production
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('SMTP_HOST'),
        port: parseInt(this.configService.get<string>('SMTP_PORT', '587')),
        secure: this.configService.get<string>('SMTP_SECURE') === 'true',
        auth: {
          user: this.configService.get<string>('SMTP_USER'),
          pass: this.configService.get<string>('SMTP_PASS'),
        },
      });
    }
  }

  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    // URL du backend pour la vérification (accessible directement)
    const backendUrl = this.configService.get<string>('BACKEND_URL', 'http://localhost:3000');
    const verificationUrl = `${backendUrl}/verify-email?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM', 'noreply@example.com'),
      to: email,
      subject: 'Vérification de votre adresse email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #007bff; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Bonjour ${firstName},</h1>
            <p>Merci de vous être inscrit ! Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
            <a href="${verificationUrl}" class="button">Vérifier mon email</a>
            <p>Ou copiez-collez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
            <p>Ce lien expirera dans 24 heures.</p>
            <div class="footer">
              <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Bonjour ${firstName},
        
        Merci de vous être inscrit ! Pour activer votre compte, veuillez vérifier votre adresse email en visitant le lien suivant :
        
        ${verificationUrl}
        
        Ce lien expirera dans 24 heures.
        
        Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw new Error('Impossible d\'envoyer l\'email de vérification');
    }
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const baseUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM', 'noreply@example.com'),
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #dc3545; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
            }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Bonjour ${firstName},</h1>
            <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
            <p>Ou copiez-collez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #dc3545;">${resetUrl}</p>
            <p>Ce lien expirera dans 1 heure.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
            <div class="footer">
              <p>Pour votre sécurité, ne partagez jamais ce lien.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw new Error('Impossible d\'envoyer l\'email de réinitialisation');
    }
  }
}

