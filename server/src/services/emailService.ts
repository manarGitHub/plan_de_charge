import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendAssignmentEmail = async (params: {
  to: string;
  taskTitle?: string;
  devis?: string;
  projectName: string;
  assignerName: string;
  assignerEmail: string;    // Add this
  dueDate?: string;
})  => {
  const { to, taskTitle, devis, projectName, assignerName, assignerEmail, dueDate } = params;

  const assigneeMailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: `Nouvelle tâche: ${taskTitle}`,
    text: `
      Vous avez été affecté à une nouvelle tâche :
      
      Dac: ${devis}
      Projet: ${projectName}
      ${dueDate ? `Date Fin: ${dueDate}` : ''}
      Responsable : ${assignerName}
      
      Veuillez consulter le tableau des tâches pour plus de détails.
    `
  };

  const assignerMailOptions = {
    from: process.env.EMAIL_FROM,
    to: assignerEmail,
    subject: `Confirmation: Vous êtes responsable de la tâche "${taskTitle}"`,
    text: `
      Bonjour ${assignerName},

      Ceci est une confirmation que vous êtes responsable de la tâche suivante :

      Tâche : ${taskTitle}
      Dac: ${devis}
      Projet: ${projectName}
      ${dueDate ? `Date Fin: ${dueDate}` : ''}
      
      Cette tâche a été assignée à : ${to}

      Merci de suivre son avancement sur le tableau de gestion.
    `
  };

  try {
    // Send email to assignee
    await transporter.sendMail(assigneeMailOptions);
    console.log("Email sent to assignee:", to);

    // Send email to assigner (responsible person)
    await transporter.sendMail(assignerMailOptions);
    console.log("Email sent to assigner (responsable):", assignerEmail);

  } catch (error) {
    console.error('Email failed to send:', error);
  }
};


// Add this to your existing email service file
export const sendCredentialsEmail = async (params: {
  to: string;
  username: string; // Add username
  tempPassword: string;
  name?: string;
  role: string;
}) => {
  const { to, username,tempPassword, name, role } = params;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: `Your Account Credentials - ${process.env.APP_NAME}`,
    text: `
      Hello ${name || 'there'},

      Your account has been successfully created with the ${role} role.

      Login credentials:
      Email: ${to}
      Your account has been created with username: ${username}
      Temporary Password: ${tempPassword}

      Please sign in here: ${process.env.APP_LOGIN_URL}
      
      You'll be required to change your password upon first login.

      Best regards,
      ${process.env.EMAIL_FROM_NAME || 'System Administration'}
    `,
    html: `
      <p>Hello ${name || 'there'},</p>
      
      <p>Your account has been successfully created with the <strong>${role}</strong> role.</p>
      
      <p><strong>Login credentials:</strong></p>
      <ul>
        <li>Email: ${to}</li>
       <li><strong>Username:</strong> ${username}</li>

        <li>Temporary Password: ${tempPassword}</li>
      </ul>
      
      <p>Please sign in here: <a href="${process.env.APP_LOGIN_URL}">${process.env.APP_LOGIN_URL}</a></p>
      
      <p>You'll be required to change your password upon first login.</p>
      
      <p>Best regards,<br>
      ${process.env.EMAIL_FROM_NAME || 'System Administration'}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Credentials email sent to:", to);
    return true;
  } catch (error) {
    console.error('Failed to send credentials email:', error);
    return false;
  }
};