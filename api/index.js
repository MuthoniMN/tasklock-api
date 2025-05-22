import express from 'express'
import path from 'path'
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import { config } from 'dotenv';

const app = express();

config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const handlebarOptions = {
    viewEngine: {
        extName: '.hbs',
        partialsDir: path.resolve('../emails'),
        defaultLayout: false,
    },
    viewPath: path.resolve('../emails'),
    extName: '.hbs',
};

transporter.use('compile', hbs(handlebarOptions));

const sendResetCode = async (email, code, name) => {
    await transporter.sendMail({
        from: '"TaskLock" <admin@tasklock.com>',
        to: email,
        subject: 'Forgot Password: Verification Code',
        template: 'forgotPassword',
        context: { name, code },
    });
};

app.get('/', (req, res) => {
    return res.send('Welcome to TaskLock API');
})

app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email, name, code } = req.body;

        await sendResetCode(email, code, name);

        return res.status(200).json({ message: 'Verification code sent to your email' });
    } catch (error) {
        console.error(error);

        return res.status(500).json({ message: 'Error sending verification code' });
    }
})

app.listen(+process.env.PORT, () => console.log('Server connected successfully'))