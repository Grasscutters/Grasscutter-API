import fs from 'fs';
import path from 'path';

export interface TemplateData {
    templateString : string,
    newString : string
}

const ReadEmailFromTemplate = (templatePath : string) => fs.readFileSync(path.resolve(process.cwd() + "/mail_templates/" + templatePath + ".html"), 'utf8');

const ReplaceTemplateString = (originalText : string, templateStrings : Array<TemplateData>) => {
    let newText = originalText;

    for(const templateString of templateStrings) {
        templateString.templateString = templateString.templateString.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        const re = new RegExp(`{${templateString.templateString}}`, 'g');
        newText = newText.replace(re, templateString.newString);
    }

    return newText;
};

export default { ReadEmailFromTemplate, ReplaceTemplateString };