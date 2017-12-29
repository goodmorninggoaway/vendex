const Joi = require('joi');

exports.view = {
  description: 'main request handler',
  handler: async (request, h) => {
    return h.view('index', { 'title': 'Home Page Title' });
  }
};

exports.login = {
  auth: false,
  validate: {
    payload: Joi.object().keys({
      email: Joi.string().email().required().trim().label('Email').error(new Error('Please enter you email address!')),
      password: Joi.string().min(2).required().trim().label('Password').error(new Error('Please enter your password!'))
    })
  },
  plugins: {
    'crumb': {
      restful: false
    }
  },
  description: 'log-in user to system',
  handler: async (request, h) => {
    const result = await User.login(request.payload.email, request.payload.password);
    if (result) {
      request.yar.set('auth', result.apiData());
      return { status: true, result: result.apiData() };
    }

    return h.view('auth', { error: 'Invalid email or password' })
  }
};

exports.loginForm = {
  auth: false,
  plugins: {
    'crumb': {
      restful: false
    }
  },
  description: 'log-in user to system',
  handler: async (request, h) => {

    const user = request.yar.get('auth');
    // if there is a valid session, send user to home page
    if (user && user.id) return h.redirect('/');

    return h.view('auth')
  }
};

exports.logout = {
  auth: false,
  plugins: {
    'crumb': {
      restful: false
    }
  },
  description: 'logout the user',
  handler: async (request, h) => {
    request.yar.reset();
    return h.redirect('/login')
  }
};
