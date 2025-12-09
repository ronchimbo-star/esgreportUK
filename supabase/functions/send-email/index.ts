import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  template: 'welcome' | 'invoice' | 'report_ready' | 'team_invite' | 'password_reset' | 'custom';
  data?: Record<string, any>;
  html?: string;
  text?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.warn('Email service not configured - RESEND_API_KEY missing');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Email service not configured'
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const authHeader = req.headers.get('Authorization')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const body: EmailRequest = await req.json();
    const { to, subject, template, data = {}, html, text } = body;

    let emailHtml = html || '';
    let emailText = text || '';

    if (template !== 'custom') {
      const templateResult = generateEmailTemplate(template, data);
      emailHtml = templateResult.html;
      emailText = templateResult.text;
    }

    const recipients = Array.isArray(to) ? to : [to];

    const emailPayload = {
      from: 'ESG Report Platform <noreply@esgreport.com>',
      to: recipients,
      subject,
      html: emailHtml,
      text: emailText,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    const result = await response.json();

    await supabase.from('activity_logs').insert({
      user_id: user.id,
      action: 'email_sent',
      entity_type: 'notification',
      details: {
        template,
        recipients: recipients.length,
        subject,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.id,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Email error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function generateEmailTemplate(
  template: string,
  data: Record<string, any>
): { html: string; text: string } {
  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
      .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
    </style>
  `;

  switch (template) {
    case 'welcome':
      return {
        html: `
          <!DOCTYPE html>
          <html>
            <head>${baseStyles}</head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome to ESG Report Platform!</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.firstName || 'there'},</p>
                  <p>Welcome to the ESG Report Platform! We're excited to have you on board.</p>
                  <p>Your account has been successfully created. You can now:</p>
                  <ul>
                    <li>Create comprehensive ESG reports</li>
                    <li>Track sustainability metrics</li>
                    <li>Collaborate with your team</li>
                    <li>Generate professional reports</li>
                  </ul>
                  <a href="${data.dashboardUrl || '#'}" class="button">Go to Dashboard</a>
                  <p>If you have any questions, feel free to reach out to our support team.</p>
                  <p>Best regards,<br>The ESG Report Team</p>
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} ESG Report Platform. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `Welcome to ESG Report Platform!\n\nHi ${data.firstName || 'there'},\n\nYour account has been successfully created. Visit your dashboard at ${data.dashboardUrl || 'https://esgreport.com/dashboard'}\n\nBest regards,\nThe ESG Report Team`,
      };

    case 'invoice':
      return {
        html: `
          <!DOCTYPE html>
          <html>
            <head>${baseStyles}</head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>New Invoice</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.customerName},</p>
                  <p>A new invoice has been generated for your account.</p>
                  <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px;"><strong>Invoice Number:</strong></td>
                      <td style="padding: 10px;">${data.invoiceNumber}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px;"><strong>Amount:</strong></td>
                      <td style="padding: 10px;">${data.amount} ${data.currency}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px;"><strong>Due Date:</strong></td>
                      <td style="padding: 10px;">${data.dueDate}</td>
                    </tr>
                  </table>
                  <a href="${data.invoiceUrl || '#'}" class="button">View Invoice</a>
                  <p>Thank you for your business!</p>
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} ESG Report Platform. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `New Invoice\n\nInvoice Number: ${data.invoiceNumber}\nAmount: ${data.amount} ${data.currency}\nDue Date: ${data.dueDate}\n\nView invoice: ${data.invoiceUrl}`,
      };

    case 'report_ready':
      return {
        html: `
          <!DOCTYPE html>
          <html>
            <head>${baseStyles}</head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Your Report is Ready!</h1>
                </div>
                <div class="content">
                  <p>Hi ${data.userName},</p>
                  <p>Your ESG report "${data.reportTitle}" has been successfully generated and is ready for review.</p>
                  <p><strong>Report Details:</strong></p>
                  <ul>
                    <li>Framework: ${data.framework}</li>
                    <li>Reporting Period: ${data.period}</li>
                    <li>Overall Score: ${data.score || 'N/A'}</li>
                  </ul>
                  <a href="${data.reportUrl || '#'}" class="button">View Report</a>
                  <p>You can now review, share, or export your report.</p>
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} ESG Report Platform. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `Your Report is Ready!\n\n"${data.reportTitle}" has been generated.\n\nView at: ${data.reportUrl}`,
      };

    case 'team_invite':
      return {
        html: `
          <!DOCTYPE html>
          <html>
            <head>${baseStyles}</head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Team Invitation</h1>
                </div>
                <div class="content">
                  <p>Hi there,</p>
                  <p>${data.inviterName} has invited you to join their team on ESG Report Platform.</p>
                  <p><strong>Organization:</strong> ${data.organizationName}</p>
                  <p><strong>Role:</strong> ${data.role}</p>
                  ${data.message ? `<p><em>"${data.message}"</em></p>` : ''}
                  <a href="${data.inviteUrl || '#'}" class="button">Accept Invitation</a>
                  <p>This invitation will expire in 7 days.</p>
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} ESG Report Platform. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `Team Invitation\n\n${data.inviterName} invited you to join ${data.organizationName}.\n\nAccept: ${data.inviteUrl}`,
      };

    case 'password_reset':
      return {
        html: `
          <!DOCTYPE html>
          <html>
            <head>${baseStyles}</head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Reset Your Password</h1>
                </div>
                <div class="content">
                  <p>Hi there,</p>
                  <p>We received a request to reset your password. Click the button below to create a new password:</p>
                  <a href="${data.resetUrl || '#'}" class="button">Reset Password</a>
                  <p>This link will expire in 1 hour.</p>
                  <p>If you didn't request this, please ignore this email.</p>
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} ESG Report Platform. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `Reset Your Password\n\nClick here to reset: ${data.resetUrl}\n\nThis link expires in 1 hour.`,
      };

    default:
      return {
        html: '<p>Email content</p>',
        text: 'Email content',
      };
  }
}
