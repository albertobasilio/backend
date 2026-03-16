const logger = require('../utils/logger');

const buildTransport = () => {
    let nodemailer;
    try {
        nodemailer = require('nodemailer');
    } catch (err) {
        throw new Error('Servico de email indisponivel: instale a dependencia nodemailer.');
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
        throw new Error('Configuracao SMTP incompleta. Defina SMTP_HOST, SMTP_PORT, SMTP_USER e SMTP_PASS.');
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });
};

exports.sendRecoveryCode = async ({ toEmail, code }) => {
    const transport = buildTransport();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    await transport.sendMail({
        from,
        to: toEmail,
        subject: 'Codigo de recuperacao - Sabor Inteligente',
        text: `Seu codigo de recuperacao e: ${code}. Este codigo expira em 15 minutos.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto;">
                <h2>Recuperacao de senha</h2>
                <p>Use o codigo abaixo para redefinir sua senha:</p>
                <div style="font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 16px 0;">${code}</div>
                <p>Este codigo expira em <strong>15 minutos</strong>.</p>
                <p>Se voce nao solicitou recuperacao, ignore este email.</p>
            </div>
        `
    });

    logger.info(`Codigo de recuperacao enviado para ${toEmail}`);
};
