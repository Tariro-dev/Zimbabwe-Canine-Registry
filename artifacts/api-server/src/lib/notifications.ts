import { logger } from './logger';

// Simulated External Notification Service (SendGrid/Twilio)
export const notificationService = {
  async sendEmail(to: string, subject: string, body: string) {
    // In production: await sgMail.send({ to, from: 'alerts@zcr.org.zw', subject, text: body });
    logger.info({ to, subject }, 'Simulated Email Sent');
    return true;
  },

  async sendSMS(to: string, message: string) {
    // In production: await twilio.messages.create({ body: message, to, from: '+263...' });
    logger.info({ to }, 'Simulated SMS Sent');
    return true;
  },

  async triggerStolenAlert(dog: any) {
    const message = `STOLEN ALERT: ${dog.name} (${dog.breed}), Microchip: ${dog.microchipId}. Report sightings via ZCR Portal.`;
    // Broadcast to all vets and regulators
    logger.info({ dogId: dog.id }, 'Broadcasting Stolen Alert to National Network');
    await this.sendEmail('vets-group@zcr.org.zw', 'URGENT: Stolen Dog Report', message);
  }
};
