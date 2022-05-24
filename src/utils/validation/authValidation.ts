import Joi from "joi";

export const registerValidation = (data) => {

    const schema = Joi.object({
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        password_confirmation: Joi.string().required()
    }); 

    return schema.validate(data);
};

export const loginValidation = (data) => {

    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
        remember_me: Joi.boolean()
    }); 

    return schema.validate(data);
};

export const verifyTokenValidation = (data) => {

    const schema = Joi.object({
        token: Joi.string().required()
    });

    return schema.validate(data);
}