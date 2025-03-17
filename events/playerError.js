const { execute } = require("./interactionCreate");

module.exports = {
    name: 'playerError',
    execute(queue, error) {
        console.log(`Player Error event: ${error.message}`);
        console.log(error)
    }
}