import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

config();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'images')));

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
        partialsDir: path.resolve(__dirname, '../emails'),
        defaultLayout: false,
    },
    viewPath: path.resolve(__dirname, '../emails'),
    extName: '.hbs',
};

transporter.use('compile', hbs(handlebarOptions));

const sendResetCode = async (email, code, name) => {
    const codeArr = code.split('');
    await transporter.sendMail({
        from: '"TaskLock" <admin@tasklock.com>',
        to: email,
        subject: 'Forgot Password: Verification Code',
        template: 'forgotPassword',
        context: { name, codeArr },
    });
};

app.get('/', (req, res) => {
    return res.send('Welcome to TaskLock API');
});

app.get("/static", (req, res) => {
    res.render("static");
});

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