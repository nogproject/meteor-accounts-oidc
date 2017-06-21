function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

function createLoginFunction(service) {
  return function loginOidc(options, callback) {
    // support a callback without options
    if (!callback && typeof options === "function") {
      callback = options;
      options = null;
    }

    var completeHandler = Accounts.oauth.credentialRequestCompleteHandler(callback);
    Oidc[service].requestCredential(options, completeHandler);
  };
};

Oidc.registerOidcService = function registerOidcService(idp) {
  Accounts.oauth.registerService(idp);
  if (Meteor.isClient) {
    Meteor['loginWith' + capitalize(idp)] = createLoginFunction(idp);
  } else {
    Accounts.addAutopublishFields({
      // not sure whether the OIDC api can be used from the browser,
      // thus not sure if we should be sending access tokens; but we do it
      // for all other oauth2 providers, and it may come in handy.
      forLoggedInUser: ['services.' + idp],
      forOtherUsers: ['services.' + idp + '.id']
    });
  }
};
