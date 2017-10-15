class Pipeline {
  constructor(initialState) {
    this.values = Object.assign({}, initialState);
    this.handlers = [];
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

  async execute() {
    for (let i = 0; i < this.handlers.length; i++) {
      const { requires = [], returns, handler } = this.handlers[i];
      const args = []
        .concat(requires)
        .reduce((memo, arg) => {
          // Once false, always false
          if (!memo) {
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
        continue;
      }

      const result = await handler(args);
      if (returns && typeof returns === 'string') {
        this.set(returns, result);
      } else if (returns && Array.isArray(returns)) {
        returns.forEach((x) => {
          const aResult = result[x];
          if (aResult === undefined) {
            this.unset(x, aResult);
          } else {
            this.set(x, aResult);
          }
        });
      }
    }

    return this.values;
  }
}

module.exports = Pipeline;
