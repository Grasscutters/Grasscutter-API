import { encrypt } from "../utils/utils";

const systemUser = {
    _id: "SYSTEM",
    username: "System",
    email: "api@grasscutters.xyz",
    password: "no.",
    activated: "activated",
    permissionLevel: "system",
    validation: {
        code: "no.",
        expiry: 0
    }
};

const Settings = [
    {
        _id: "REGISTRATION_ENABLED",
        value: true
    },
    {
        _id: "MAINTENANCE_MODE",
        value: false
    },
    {
        _id: "PLUGINS_UPLOAD_ENABLED",
        value: true
    },
    {
        _id: "CULTIVATION_GAMEVERSION",
        value: 2.6
    },
    {
        _id: "CULTIVATION_BGFILE",
        value: ""
    },
    {
        _id: "MAIL",
        value: {
            name: "example.com",
            host: "mail.example.com",
            port: 587,
            secure: false,
            auth: {
                user: "noreply@example.com",
                pass: encrypt("default_password"),
            },
            rejectUnauthorized: false,
            from: "Example <noreply@example.com>",
            dkim: {
                domainName: "example.com",
                keySelector: "202104",
                privateKey: encrypt("invalid")
            }
        }
    }
];

export default { Settings, systemUser };