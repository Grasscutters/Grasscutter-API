import nodemailer from "nodemailer";
import { getSetting } from "../database/model/settings";
import Logger from "./logger";
import {decrypt} from "./utils";

const transporter = (mailSettings) => {
    return nodemailer.createTransport({
        name: mailSettings.name,
        host: mailSettings.host,
        port: mailSettings.port,
        secure: mailSettings.secure,
        auth: {
            user: mailSettings.auth.user,
            pass: decrypt(mailSettings.auth.pass),
        },
        logger: true,
        transactionLog: false, // include SMTP traffic in the logs
        tls: {
            rejectUnauthorized: mailSettings.rejectUnauthorized,
        },
    });
};

const sendEmail = async (to: string, subject: string, htmlContent: string) => {
    const mailSettings = await getSetting("MAIL");

    const message = {
        // Comma separated list of recipients
        to: to,
        from: mailSettings.from,

        // Subject of the message
        subject: subject,

        // HTML body
        html: htmlContent,

        dkim: {
            domainName: mailSettings.dkim.domainName,
            keySelector: mailSettings.dkim.keySelector,
            privateKey: decrypt(mailSettings.dkim.privateKey),
        },
    };

    transporter(mailSettings).sendMail(message, (error, info) => {
        if (error) {
            Logger.log("error", `Error occurred while sending mail ${error.message}`);
            return;
        }

        Logger.log("info", "Message sent successfully!");

        // only needed when using pooled connections
    });
};

export default { sendEmail };
