function ConcatenatePlaceholder(apiEndpoint, deviceId){
    //possible change to pass key value array instead of hard coded  
    const replacements = {
        id: deviceId
    };

    //replaces anything in curly brackets with replacements key/values
    const completedURL = apiEndpoint.replace(/{\w+}/g, placeholder =>
        replacements[placeholder.substring(1, placeholder.length - 1)] || placeholder
    );

    return completedURL;
};

module.exports = {ConcatenatePlaceholder};