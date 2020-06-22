const config = require('./config');
const fs = require('fs');
const shell = require('./shell');
const OldWebViewUAUserAgent = 'Mozilla/5.0 (Linux; U; Android 4.1.1; en-gb; Build/KLP) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30';

const createFolderIfRequired = (path) => {

    if (!fs.existsSync(path)) {
        fs.mkdirSync(path, {recursive: true});
    }

};

module.exports = (url, folder, name, referer, userAgent = OldWebViewUAUserAgent, tries = 3, timeout = 0, compression = 'auto') => {

    let optionalParameters = [];

    if (name && folder) {

        const folderPath = `${config.downloadRoot}/${folder}`;
        createFolderIfRequired(folderPath);

        optionalParameters.push(`--output-document="${folderPath}/${name}"`);

    } else if (name && !folder) {

        optionalParameters.push(`--output-document="${name}"`);

    } else if (folder && !name) {

        const folderPath = `${config.downloadRoot}/${folder}`;
        createFolderIfRequired(folderPath);
        optionalParameters.push(`--directory-prefix="${folderPath}"`);

    }

    if (referer) {

        optionalParameters.push(`--referer="${referer}"`);

    }

    const commandToExecute = `wget --force-directories --user-agent="${userAgent}" --tries=${tries} --continue --timeout=${timeout} --compression=${compression} --retry-connrefused ${optionalParameters.join(' ')} ${url}`;

    return shell.exec(commandToExecute).then(data => {

        //wget messages are normally reported to standard error, even if they are not an error
        const {stderr} = data;
        return stderr;

    });

};
