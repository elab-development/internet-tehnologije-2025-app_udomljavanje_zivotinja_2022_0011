import nodemailer from "nodemailer";

function getEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Nedostaje env varijabla: ${name}`);
  return v;
}

export async function posaljiMail(args: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const host = getEnv("SMTP_HOST");
  const port = Number(getEnv("SMTP_PORT"));
  const user = getEnv("SMTP_USER");
  const pass = getEnv("SMTP_PASS");
  const from = getEnv("SMTP_FROM");

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = true, 587 = false
    auth: { user, pass },
  });

  return transporter.sendMail({
    from,
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: args.html,
  });
}
