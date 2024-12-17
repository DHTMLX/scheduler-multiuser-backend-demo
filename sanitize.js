const sanitizeHtml = require('sanitize-html');

function sanitizeObject(obj) {
    if (typeof obj === 'string') {
        return sanitizeHtml(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject); 
    }
    if (typeof obj === 'object' && obj !== null) {
        const sanitized = {};
        Object.keys(obj).forEach(key => {
            sanitized[key] = sanitizeObject(obj[key]); 
        });
        return sanitized;
    }
    return obj;
}

module.exports = sanitizeObject;