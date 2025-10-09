import { Invitation } from '@prisma/client';
interface InvitationEmailData extends Invitation {
    sender: {
        firstName: string;
        lastName: string;
    };
    organization: {
        name: string;
    };
}
export declare class EmailService {
    private transporter;
    private logger;
    private isConfigured;
    constructor();
    private initializeTransporter;
    sendInvitationEmail(invitation: InvitationEmailData): Promise<boolean>;
    sendWelcomeEmail(email: string, firstName: string, organizationName: string): Promise<boolean>;
    private getInvitationEmailTemplate;
    private getInvitationEmailText;
    private getWelcomeEmailTemplate;
    private getWelcomeEmailText;
    verifyConnection(): Promise<boolean>;
    testEmailSending(): Promise<boolean>;
}
export {};
//# sourceMappingURL=EmailService.d.ts.map