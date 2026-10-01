import nodemailer from 'nodemailer';
// importa tu cliente de supabase si lo necesitas aquí

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendIncidentNotification = async ({ emailsTo, subject, incidentDetails }) => {
  const mailOptions = {
    from: `"Sistema de Incidencias" <${process.env.EMAIL_USER}>`,
    to: emailsTo,
    subject: subject,
    html: `
      <h2>Notificación de Incidencia</h2>
      <p>Se ha registrado un reporte en el sistema:</p>
      <ul>
        <li><strong>Ubicación:</strong> ${incidentDetails.location}</li>
        <li><strong>Tipo:</strong> ${incidentDetails.type}</li>
      </ul>
    `,
  };

  return await transporter.sendMail(mailOptions);
};