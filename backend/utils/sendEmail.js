import nodemailer from 'nodemailer';

const sendEmail = async (userEmail, carModel, actionType) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'edrees88ah@gmail.com', // إيميل موقعك
            pass: 'nupz pqir idwx fhbj'  // 🚨 ضع هنا الـ 16 حرفاً (App Password)
        }
    });

    const message = actionType === 'active' 
        ? `تهانينا! تم قبول إعلانك لسيارة ${carModel} بنجاح.` 
        : `نعتذر، تم رفض إعلانك لسيارة ${carModel} لمخالفته الشروط.`;

    const mailOptions = {
        from: '"سوق سياراتي 🚗" <edrees88ah@gmail.com>',
        to: userEmail,
        subject: 'تحديث حالة إعلانك',
        text: message
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("فشل إرسال الإيميل:", error.message);
    }
};

export default sendEmail;