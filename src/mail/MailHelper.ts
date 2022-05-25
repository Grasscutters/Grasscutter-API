import fs from 'fs'
import path from 'path'

export interface TemplateData {
    templateString : string,
    newString : string
}

var ReadEmailFromTemplate = (templatePath : string) => fs.readFileSync(path.resolve(process.cwd() + "/mail_templates/" + templatePath + ".html"), 'utf8')

var ReplaceTemplateString = (originalText : string, templateStrings : Array<TemplateData>) => {
    var newText = originalText;
    
    for(var templateString of templateStrings) {
        templateString.templateString = templateString.templateString.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        var re = new RegExp(`{${templateString.templateString}}`, 'g')
        newText = newText.replace(re, templateString.newString);
    }

    return newText;
}

export default { ReadEmailFromTemplate, ReplaceTemplateString }