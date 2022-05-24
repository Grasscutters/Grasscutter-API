import Joi from "joi";
import joiFileExtensions from "joi-file-extensions";

export const indexValidation = (data) => {
    const schema = Joi.object({
        paginateLimit: Joi.number()
    }); 

    return schema.validate(data);
}

export const newPluginValidation = (data) => {
    const links = Joi.object({
        name: Joi.string().required(), 
        url: Joi.string().required().uri({
            scheme: [
                'http',
                'https'
            ]
        })
    })

    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        version: Joi.string().required(),
        testedGCVersions: Joi.array().items(Joi.string().required()).required(),
        supportedLanguages: Joi.array().items(Joi.string().required()).required(),
        changeLog: Joi.string().required(),
        links: Joi.array().items(links)
    });

    return schema.validate(data);
}