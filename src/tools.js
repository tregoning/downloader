const { performance } = require('perf_hooks');

/**
 * Generates a random UUID
 * @returns {string}
 */
const uuid = () => {

    let randomTime = performance.now();

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {

        /* eslint-disable no-bitwise, no-mixed-operators */
        const r = (randomTime + Math.random() * 16) % 16 | 0;
        randomTime = Math.floor(randomTime / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        /* eslint-enable no-bitwise, no-mixed-operators */

    });

};

/**
 * Deep clones a JSON object
 *
 * @param {Object} json - JSON payload to clone
 *
 * @returns {Object} Cloned JSON object
 */
const clone = json => JSON.parse(JSON.stringify(json));

module.exports = {

    uuid,
    clone

};