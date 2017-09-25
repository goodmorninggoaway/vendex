// Forked from https://github.com/stevetarver/excel-as-json. Converted from coffeescript to es6 and added processStream
// TODO Create a PR against https://github.com/stevetarver/excel-as-json
/***
 The MIT License (MIT)

 Copyright (c) 2015 stevetarver

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// Create a list of json objects; 1 object per excel sheet row
//
// Assume: Excel spreadsheet is a rectangle of data, where the first row is
// object keys and remaining rows are object values and the desired json
// is a list of objects. Alternatively, data may be column oriented with
// col 0 containing key names.
//
// Dotted notation: Key row (0) containing firstName, lastName, address.street,
// address.city, address.state, address.zip would produce, per row, a doc with
// first and last names and an embedded doc named address, with the address.
//
// Arrays: may be indexed (phones[0].number) or flat (aliases[]). Indexed
// arrays imply a list of objects. Flat arrays imply a semicolon delimited list.
//
// USE:
//  From a shell
//    coffee src/excel-as-json.coffee
//
const fs = require('fs');
const path = require('path');
const excel = require('excel');

const BOOLTEXT = ['true', 'false'];
const BOOLVALS = { 'true': true, 'false': false };

const isArray = obj => Object.prototype.toString.call(obj) === '[object Array]';


// Extract key name and array index from names[1] or names[]
// return [keyIsList, keyName, index]
// for names[1] return [true,  keyName,  index]
// for names[]  return [true,  keyName,  undefined]
// for names    return [false, keyName,  undefined]
const parseKeyName = function (key) {
    const index = key.match(/\[(\d+)\]$/);
    switch (false) {
        case !index:
            return [true, key.split('[')[0], Number(index[1])];
        case key.slice(-2) !== '[]':
            return [true, key.slice(0, -2), undefined];
        default:
            return [false, key, undefined];
    }
};


// Convert a list of values to a list of more native forms
const convertValueList = list => Array.from(list).map((item) => convertValue(item));


// Convert values to native types
// Note: all values from the excel module are text
var convertValue = function (value) {
    // isFinite returns true for empty or blank strings, check for those first
    if ((value.length === 0) || !/\S/.test(value)) {
        return value;
    } else if (isFinite(value)) {
        return Number(value);
    } else {
        const testVal = value.toLowerCase();
        if (Array.from(BOOLTEXT).includes(testVal)) {
            return BOOLVALS[testVal];
        } else {
            return value;
        }
    }
};


// Assign a value to a dotted property key - set values on sub-objects
var assign = function (obj, key, value, options) {
    // On first call, a key is a string. Recursed calls, a key is an array
    let i;
    if (typeof key !== 'object') {
        key = key.split('.');
    }
    // Array element accessors look like phones[0].type or aliases[]
    const [keyIsList, keyName, index] = Array.from(parseKeyName(key.shift()));

    if (key.length) {
        if (keyIsList) {
            // if our object is already an array, ensure an object exists for this index
            if (isArray(obj[keyName])) {
                if (!obj[keyName][index]) {
                    let asc, end;
                    for (i = obj[keyName].length, end = index, asc = obj[keyName].length <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
                        obj[keyName].push({});
                    }
                }
                // else set this value to an array large enough to contain this index
            } else {
                obj[keyName] = ((() => {
                    let asc1, end1;
                    const result = [];
                    for (i = 0, end1 = index, asc1 = 0 <= end1; asc1 ? i <= end1 : i >= end1; asc1 ? i++ : i--) {
                        result.push({});
                    }
                    return result;
                })());
            }
            return assign(obj[keyName][index], key, value, options);
        } else {
            if (obj[keyName] == null) {
                obj[keyName] = {};
            }
            return assign(obj[keyName], key, value, options);
        }
    } else {
        if (keyIsList && (index != null)) {
            console.error(`WARNING: Unexpected key path terminal containing an indexed list for <${keyName}>`);
            console.error("WARNING: Indexed arrays indicate a list of objects and should not be the last element in a key path");
            console.error("WARNING: The last element of a key path should be a key name or flat array. E.g. alias, aliases[]");
        }
        if (keyIsList && (index == null)) {
            if (!(options.omitEmptyFields && (value === ''))) {
                return obj[keyName] = convertValueList(value.split(';'));
            }
        } else {
            if (!(options.omitEmptyFields && (value === ''))) {
                return obj[keyName] = convertValue(value);
            }
        }
    }
};


// Transpose a 2D array
const transpose = matrix => __range__(0, matrix[0].length, false).map((i) => (Array.from(matrix).map((t) => t[i])));


// Convert 2D array to nested objects. If row oriented data, row 0 is dotted key names.
// Column oriented data is transposed
const convert = function (data, options) {
    if (options.isColOriented) {
        data = transpose(data);
    }

    const keys = data[0];
    const rows = data.slice(1);

    const result = [];
    for (let row of Array.from(rows)) {
        const item = {};
        for (let index = 0; index < row.length; index++) {
            const value = row[index];
            assign(item, keys[index], value, options);
        }
        result.push(item);
    }
    return result;
};


// Write JSON encoded data to file
// call back is callback(err)
const write = function (data, dst, callback) {
    // Create the target directory if it does not exist
    const dir = path.dirname(dst);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    return fs.writeFile(dst, JSON.stringify(data, null, 2), function (err) {
        if (err) {
            return callback(`Error writing file ${dst}: ${err}`);
        } else {
            return callback(undefined);
        }
    });
};


// src: xlsx file that we will read sheet 0 of
// dst: file path to write json to. If null, simply return the result
// options: see below
// callback(err, data): callback for completion notification
//
// options:
//   sheet:           string;  1:     numeric, 1-based index of target sheet
//   isColOriented:   boolean: false; are objects stored in excel columns; key names in col A
//   omitEmptyFields: boolean: false: do not include keys with empty values in json output. empty values are stored as ''
//
// convertExcel(src, dst) <br/>
//   will write a row oriented xlsx sheet 1 to `dst` as JSON with no notification
// convertExcel(src, dst, {isColOriented: true}) <br/>
//   will write a col oriented xlsx sheet 1 to file with no notification
// convertExcel(src, dst, {isColOriented: true}, callback) <br/>
//   will write a col oriented xlsx to file and notify with errors and parsed data
// convertExcel(src, null, null, callback) <br/>
//   will parse a row oriented xslx using default options and return errors and the parsed data in the callback
//
const _DEFAULT_OPTIONS = {
    sheet: '1',
    isColOriented: false,
    omitEmptyFields: false
};

// Ensure options sane, provide defaults as appropriate
const _validateOptions = function (options) {
    if (!options) {
        options = _DEFAULT_OPTIONS;
    } else {
        if (!options.hasOwnProperty('sheet')) {
            options.sheet = '1';
        } else {
            // ensure sheet is a text representation of a number
            if (!isNaN(parseFloat(options.sheet)) && isFinite(options.sheet)) {
                if (options.sheet < 1) {
                    options.sheet = '1';
                } else {
                    // could be 3 or '3'; force to be '3'
                    options.sheet = `${options.sheet}`;
                }
            } else {
                // something bizarre like true, [Function: isNaN], etc
                options.sheet = '1';
            }
        }
        if (!options.hasOwnProperty('isColOriented')) {
            options.isColOriented = false;
        }
        if (!options.hasOwnProperty('omitEmptyFields')) {
            options.omitEmptyFields = false;
        }
    }
    return options;
};


const processFile = function (src, dst, options, callback) {
    if (options == null) {
        options = _DEFAULT_OPTIONS;
    }
    if (callback == null) {
        callback = undefined;
    }
    options = _validateOptions(options);

    // provide a callback if the user did not
    if (!callback) {
        callback = function (err, data) {
        };
    }

    // NOTE: 'excel' does not properly bubble file not found and prints
    //       an ugly error we can't trap, so look for this common error first
    if (!fs.existsSync(src)) {
        return callback(`Cannot find src file ${src}`);
    } else {
        return excel(src, options.sheet, function (err, data) {
            if (err) {
                return callback(`Error reading ${src}: ${err}`);
            } else {
                const result = convert(data, options);
                if (dst) {
                    return write(result, dst, function (err) {
                        if (err) {
                            return callback(err);
                        } else {
                            return callback(undefined, result);
                        }
                    });
                } else {
                    return callback(undefined, result);
                }
            }
        });
    }
};

const processStream = function (src, dst, options, callback) {
    if (options == null) {
        options = _DEFAULT_OPTIONS;
    }
    if (callback == null) {
        callback = undefined;
    }
    options = _validateOptions(options);

    // provide a callback if the user did not
    if (!callback) {
        callback = function (err, data) {
        };
    }

    // NOTE: 'excel' does not properly bubble file not found and prints
    //       an ugly error we can't trap, so look for this common error first
    return excel(src, options.sheet, function (err, data) {
        if (err) {
            return callback(`Error reading stream: ${err}`);
        } else {
            const result = convert(data, options);
            if (dst) {
                return write(result, dst, function (err) {
                    if (err) {
                        return callback(err);
                    } else {
                        return callback(undefined, result);
                    }
                });
            } else {
                return callback(undefined, result);
            }
        }
    });
};

// This is the single expected module entry point
exports.processFile = processFile;
exports.processStream = processStream;

// Unsupported use
// Exposing remaining functionality for unexpected use cases, testing, etc.
exports.assign = assign;
exports.convert = convert;
exports.convertValue = convertValue;
exports.parseKeyName = parseKeyName;
exports._validateOptions = _validateOptions;
exports.transpose = transpose;

function __range__(left, right, inclusive) {
    let range = [];
    let ascending = left < right;
    let end = !inclusive ? right : ascending ? right + 1 : right - 1;
    for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
        range.push(i);
    }
    return range;
}