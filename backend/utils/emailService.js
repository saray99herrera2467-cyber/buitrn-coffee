const Brevo = require('@getbrevo/brevo');

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(0, process.env.BREVO_API_KEY);

// Función genérica para enviar correos
const enviarCorreo = async (email, nombre, asunto, contenidoHtml) => {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.subject = asunto;
        sendSmtpEmail.to = [{ email: email, name: nombre }];
        sendSmtpEmail.htmlContent = contenidoHtml;
        sendSmtpEmail.sender = { 
            name: "Buitrón Coffee", 
            email: process.env.EMAIL_FROM || "no-reply@buitroncoffee.com"
        };

        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`✅ Correo enviado a ${email}:`, response.messageId);
        return true;
    } catch (error) {
        console.error(`❌ Error enviando correo a ${email}:`, error);
        return false;
    }
};

// =============================================
// 1. CORREO DE BIENVENIDA AL REGISTRARSE
// =============================================
const enviarBienvenida = async (email, nombre) => {
    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f5f0; border-radius: 20px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #c0392b 0%, #8e2e23 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">☕ Buitrón Coffee</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">El mejor café artesanal de Colombia</p>
            </div>
            <div style="padding: 30px; background: white;">
                <h2 style="color: #2c3e50; margin-top: 0;">¡Bienvenido, ${nombre}! ✨</h2>
                <p style="color: #555; line-height: 1.6;">Gracias por formar parte de nuestra comunidad cafetera. En Buitrón Coffee nos apasiona brindarte la mejor experiencia con nuestros productos de alta calidad.</p>
                <div style="background: #fdf2e9; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0; color: #c0392b; font-weight: bold;">🎉 Disfruta de un 10% de descuento en tu primera compra 🎉</p>
                </div>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/catalogo" style="display: inline-block; background: #c0392b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 30px; margin-top: 20px;">Explorar productos →</a>
            </div>
            <div style="background: #2c3e50; padding: 20px; text-align: center;">
                <p style="color: #ecf0f1; margin: 0;">© 2025 Buitrón Coffee - Calidad y tradición</p>
            </div>
        </div>
    `;
    return enviarCorreo(email, nombre, "¡Bienvenido a Buitrón Coffee! ☕", html);
};

// =============================================
// 2. CORREO DE RECUPERACIÓN DE CONTRASEÑA
// =============================================
const enviarRecuperacionContrasena = async (email, nombre, codigo) => {
    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 550px; margin: 0 auto; background: #f9f5f0; border-radius: 20px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #c0392b 0%, #8e2e23 100%); padding: 25px; text-align: center;">
                <h1 style="color: white; margin: 0;">☕ Buitrón Coffee</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Recuperación de contraseña</p>
            </div>
            <div style="padding: 30px; background: white;">
                <h2 style="color: #2c3e50; margin-top: 0;">Hola, ${nombre}</h2>
                <p style="color: #555; line-height: 1.6;">Hemos recibido una solicitud para restablecer tu contraseña.</p>
                <div style="background: #fdf2e9; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center;">
                    <p style="margin: 0 0 10px; color: #2c3e50; font-weight: bold;">Tu código de verificación es:</p>
                    <p style="margin: 0; font-size: 32px; font-weight: bold; color: #c0392b; letter-spacing: 5px;">${codigo}</p>
                </div>
                <div style="background: #fff3e0; padding: 15px; border-radius: 12px; margin: 20px 0;">
                    <p style="margin: 0; color: #e67e22;">⏰ Este código expirará en <strong>5 minutos</strong>.</p>
                </div>
                <p style="color: #555; line-height: 1.6;">Si no solicitaste este cambio, puedes ignorar este mensaje. Tu contraseña permanecerá segura.</p>
                <hr style="margin: 25px 0; border-color: #eee;">
                <p style="color: #888; font-size: 12px; text-align: center;">Buitrón Coffee - Café de calidad para gente exigente</p>
            </div>
            <div style="background: #2c3e50; padding: 15px; text-align: center;">
                <p style="color: #ecf0f1; margin: 0; font-size: 12px;">© 2025 Buitrón Coffee - Todos los derechos reservados</p>
            </div>
        </div>
    `;
    return enviarCorreo(email, nombre, "Recuperación de contraseña - Buitrón Coffee", html);
};

// =============================================
// 3. CORREO DE CONFIRMACIÓN DE PQRS RECIBIDA
// =============================================
const enviarConfirmacionPQRS = async (email, nombre, codigoReferencia, tipo) => {
    const tipos = {
        pregunta: 'Pregunta',
        queja: 'Queja',
        reclamo: 'Reclamo',
        sugerencia: 'Sugerencia',
        felicitacion: 'Felicitación'
    };
    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f5f0; border-radius: 20px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #c0392b 0%, #8e2e23 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">☕ Buitrón Coffee</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">PQRS</p>
            </div>
            <div style="padding: 30px; background: white;">
                <h2 style="color: #2c3e50; margin-top: 0;">¡Hemos recibido tu ${tipos[tipo]}! 📋</h2>
                <p style="color: #555; line-height: 1.6;">Hola, <strong>${nombre}</strong>. Gracias por comunicarte con nosotros.</p>
                <div style="background: #fdf2e9; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <p style="margin: 0 0 10px; color: #2c3e50;"><strong>Código de referencia:</strong></p>
                    <p style="margin: 0; font-size: 24px; font-weight: bold; color: #c0392b; letter-spacing: 2px;">${codigoReferencia}</p>
                </div>
                <p style="color: #555; line-height: 1.6;">⏳ <strong>¿Qué sigue?</strong> Tu solicitud ha sido enviada a nuestro equipo. Te solicitamos aguardar mientras la revisamos y te damos una respuesta.</p>
                <p style="color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">Por favor, conserva tu código de referencia para cualquier consulta futura.</p>
            </div>
            <div style="background: #2c3e50; padding: 20px; text-align: center;">
                <p style="color: #ecf0f1; margin: 0;">© 2025 Buitrón Coffee</p>
            </div>
        </div>
    `;
    return enviarCorreo(email, nombre, `Hemos recibido tu ${tipos[tipo]} - Código: ${codigoReferencia}`, html);
};

// =============================================
// 4. CORREO DE RESPUESTA A PQRS
// =============================================
const enviarRespuestaPQRS = async (email, nombre, respuesta, codigoReferencia) => {
    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f5f0; border-radius: 20px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #c0392b 0%, #8e2e23 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">☕ Buitrón Coffee</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Respuesta a tu PQRS</p>
            </div>
            <div style="padding: 30px; background: white;">
                <h2 style="color: #2c3e50; margin-top: 0;">¡El administrador te ha respondido! ✉️</h2>
                <p style="color: #555; line-height: 1.6;">Hola, <strong>${nombre}</strong>. Ya tenemos una respuesta para tu solicitud.</p>
                <div style="background: #fdf2e9; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <p style="margin: 0 0 10px; color: #2c3e50;"><strong>Código de referencia:</strong></p>
                    <p style="margin: 0; font-size: 18px; font-weight: bold; color: #c0392b;">${codigoReferencia}</p>
                    <p style="margin: 15px 0 5px; color: #2c3e50;"><strong>Respuesta del administrador:</strong></p>
                    <p style="margin: 0; padding: 15px; background: white; border-radius: 10px; color: #2c3e50; line-height: 1.5; border-left: 4px solid #c0392b;">${respuesta}</p>
                </div>
                <p style="color: #555; line-height: 1.6;">Si tienes más preguntas, no dudes en contactarnos nuevamente.</p>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/consultarpqrs" style="display: inline-block; background: #c0392b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 30px; margin-top: 20px;">Consultar mi PQRS →</a>
            </div>
            <div style="background: #2c3e50; padding: 20px; text-align: center;">
                <p style="color: #ecf0f1; margin: 0;">© 2025 Buitrón Coffee</p>
            </div>
        </div>
    `;
    return enviarCorreo(email, nombre, `Respuesta a tu PQRS #${codigoReferencia}`, html);
};

// =============================================
// 5. CORREO DE CONFIRMACIÓN DE PEDIDO
// =============================================
const enviarConfirmacionPedido = async (email, nombre, pedidoId, total, fechaLimite) => {
    const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f5f0; border-radius: 20px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #c0392b 0%, #8e2e23 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">☕ Buitrón Coffee</h1>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Confirmación de Pedido</p>
            </div>
            <div style="padding: 30px; background: white;">
                <h2 style="color: #2c3e50; margin-top: 0;">¡Pedido confirmado, ${nombre}! ✅</h2>
                <p style="color: #555; line-height: 1.6;">Hemos generado tu pedido correctamente. A continuación los detalles:</p>
                <div style="background: #fdf2e9; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <p style="margin: 0 0 10px;"><strong>📋 Número de pedido:</strong> #${pedidoId}</p>
                    <p style="margin: 0 0 10px;"><strong>💰 Total a pagar:</strong> $${total.toLocaleString()}</p>
                    <p style="margin: 0;"><strong>⏰ Fecha límite de pago:</strong> ${fechaLimite}</p>
                </div>
                <div style="background: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #c6f7d0;">
                    <p style="margin: 0 0 10px; color: #2e7d32; font-weight: bold;">📍 Instrucciones para tu pedido:</p>
                    <p style="margin: 0; color: #555; line-height: 1.6;">Por favor, dirígete a nuestro punto físico para recibir tus productos y realizar el pago.</p>
                    <p style="margin: 10px 0 0; color: #2c3e50;"><strong>🏠 Dirección:</strong> Calle 123 # 45-67, Bogotá, Colombia</p>
                </div>
                <div style="background: #fff3e0; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <p style="margin: 0; color: #e67e22; font-weight: bold;">⚠️ Importante:</p>
                    <p style="margin: 5px 0 0; color: #555;">Tus pedidos tienen fecha límite para ser pagados. Te invitamos a ser puntual para no perder tu reserva. ¡Gracias por tu confianza!</p>
                </div>
                <p style="color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px;">¡Nos vemos pronto! ☕</p>
            </div>
            <div style="background: #2c3e50; padding: 20px; text-align: center;">
                <p style="color: #ecf0f1; margin: 0;">© 2025 Buitrón Coffee - Calidad y tradición</p>
            </div>
        </div>
    `;
    return enviarCorreo(email, nombre, `Pedido confirmado #${pedidoId} - ¡Gracias por tu compra!`, html);
};

module.exports = {
    enviarBienvenida,
    enviarRecuperacionContrasena,
    enviarConfirmacionPQRS,
    enviarRespuestaPQRS,
    enviarConfirmacionPedido
};