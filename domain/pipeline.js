const { executeSerially } = require('./util');
const MESSAGE_LEVEL = require('./models/enums/exportMessageLevel');

class Pipeline {
  constructor(initialState) {
    this.values = Object.assign({}, initialState);
    this.handlers = [];
    this.messages = [];
  }

  get(key) {
    return this.values[key];
  }

  set(key, value) {
    this.values[key] = value;
  }

  unset(key) {
    delete this.values[key];
  }

  addHandler(handler) {
    this.handlers.push(handler);
    return this;
  }

  addMessage({ message, messageLevel }) {
    this.messages.push({ message, messageLevel });
  }

  getMessages() {
    return this.messages;
  }

  async executeHandler({ optional = [], requires = [], returns, handler }) {
    console.group();
    console.log(`Starting ${handler.name}()`);

    // Add required args
    let args = requires.reduce((memo, arg) => {
      // Once false, always false
      if (!memo) {
        return memo;
      }

      if (arg === '$messages') {
        memo[arg] = this.getMessages();
        return memo;
      }

      // Early return if a required argument is missing
      const value = this.get(arg);
      if (!value) {
        console.error(`Missing required value ${arg}`);
        return false;
      }

      memo[arg] = value;
      return memo;
    }, {});

    // Skip this handler if the requirements are not met
    if (args === false) {
      console.log(`Skipping ${handler.name}()`);
      console.groupEnd();

      return undefined;
    }

    // Add optional args
    args = optional.reduce((memo, arg) => {
      memo[arg] = this.get(arg);
      return memo;
    }, args || {});

    // Execute the handler
    let result = await handler(args);

    if (returns && typeof returns === 'string') {
      this.set(returns, result);
    } else if (returns && Array.isArray(returns)) {
      result = result || {};
      returns.forEach(x => {
        if (x === '$message' && result.$message) {
          this.addMessage({
            message: result.$message,
            messageLevel: result.$messageLevel || MESSAGE_LEVEL.INFO,
          });
        }

        // These keys are pipeline directives and should be handled before this
        if (x.startsWith('$')) {
          return;
        }

        const aResult = result[x];
        if (aResult === undefined) {
          this.unset(x, aResult);
        } else {
          this.set(x, aResult);
        }
      });
    }

    console.log(`Finished ${handler.name}()`);
    console.groupEnd();
  }

  async execute() {
    return executeSerially(this.handlers, this.executeHandler.bind(this)).then(
      () => this.values,
    );
  }
}

module.exports = Pipeline;
