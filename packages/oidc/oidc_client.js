Oidc = {};

function createRequestCredentialsFunction(service) {
  return function requestCredentialsOidc(options, credentialRequestCompleteCallback) {
    // support both (options, callback) and (callback).
    if (!credentialRequestCompleteCallback && typeof options === 'function') {
      credentialRequestCompleteCallback = options;
      options = {};
    }

    var config = ServiceConfiguration.configurations.findOne({service: service});
    if (!config) {
      credentialRequestCompleteCallback && credentialRequestCompleteCallback(
        new ServiceConfiguration.ConfigError('Service ' + service + ' not configured.'));
      return;
    }
    var credentialToken = Random.secret();
    var loginStyle = OAuth._loginStyle(service, config, options);
    var scope = config.requestPermissions || ['openid', 'profile', 'email'];

    // options
    options = options || {};
    options.client_id = config.clientId;
    options.response_type = options.response_type || 'code';
    options.redirect_uri = OAuth._redirectUri(service, config);
    options.state = OAuth._stateParam(loginStyle, credentialToken, options.redirectUrl);
    options.scope = scope.join(' ');

    if (config.loginStyle === 'popup') {
      options.display = 'popup';
    }

    var loginUrl = config.serverUrl + config.authorizationEndpoint;
    var first = true;
    for (var k in options) {
      if (first) {
        loginUrl += '?';
        first = false;
      }
      else {
        loginUrl += '&'
      }
      loginUrl += encodeURIComponent(k) + '=' + encodeURIComponent(options[k]);
    }

    options.popupOptions = options.popupOptions || {};
    var popupOptions = {
      width:  options.popupOptions.width || 320,
      height: options.popupOptions.height || 450
    };

    OAuth.launchLogin({
      loginService: service,
      loginStyle: loginStyle,
      loginUrl: loginUrl,
      credentialRequestCompleteCallback: credentialRequestCompleteCallback,
      credentialToken: credentialToken,
      popupOptions: popupOptions,
    });
  };
};

Oidc.registerClient = function registerClient(idp) {
  Oidc[idp] = {};
  // Request OpenID Connect credentials for the user
  // @param options {optional}
  // @param credentialRequestCompleteCallback {Function} Callback function to call on
  //   completion. Takes one argument, credentialToken on success, or Error on
  //   error.
  Oidc[idp].requestCredential = createRequestCredentialsFunction(idp);
};
