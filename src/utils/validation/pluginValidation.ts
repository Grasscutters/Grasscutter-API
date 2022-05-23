import Joi from "joi";
import joiFileExtensions from "joi-file-extensions";

export const indexValidation = (data) => {
    const schema = Joi.object({
        paginateLimit: Joi.number()
    }); 

    return schema.validate(data);
}

export const newPluginValidation = (data) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        version: Joi.string().required(),
        changeLog: Joi.string().required(),
        links: Joi.array().items(
            Joi.string().label("name").required(), 
            Joi.string().label("url").required().uri({
                scheme: [
                    'http',
                    'https'
                ]
            })
        )
    });

    return schema.validate(data);
}