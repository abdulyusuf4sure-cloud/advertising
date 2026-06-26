// Lightweight Firebase Auth helper (uses compat CDN scripts loaded in pages).
// Exposes: googleSignIn(), facebookSignIn(), signOutUser(), requireAuthRedirect()
if (window.FIREBASE_CONFIG && window.FIREBASE_CONFIG.apiKey) {
  try {
    firebase.initializeApp(window.FIREBASE_CONFIG);
    const auth = firebase.auth();

    window.googleSignIn = async function () {
      const provider = new firebase.auth.GoogleAuthProvider();
      try {
        await auth.signInWithPopup(provider);
        window.location.href = 'index.html';
      } catch (e) { alert('Google sign-in failed: ' + e.message); }
    };

    window.facebookSignIn = async function () {
      const provider = new firebase.auth.FacebookAuthProvider();
      try {
        await auth.signInWithPopup(provider);
        window.location.href = 'index.html';
      } catch (e) { alert('Facebook sign-in failed: ' + e.message); }
    };

    window.signOutUser = async function () {
      try { await auth.signOut(); window.location.href = 'login.html'; } catch (e) { console.error(e); }
    };

    // Redirect to login by default if not authenticated and Firebase config is present
    window.requireAuthRedirect = function () {
      auth.onAuthStateChanged(user => {
        if (!user) {
          if (!location.pathname.endsWith('login.html') && !location.pathname.endsWith('signup.html')) {
            window.location.replace('login.html');
          }
        }
      });
    };
  } catch (e) {
    console.error('Firebase init error', e);
  }
} else {
  // No config provided — expose no-op functions so pages don't break.
  window.googleSignIn = () => alert('Firebase config missing — add auth-config.js');
  window.facebookSignIn = () => alert('Firebase config missing — add auth-config.js');
  window.signOutUser = () => { alert('Not signed in (no auth configured)'); };
  window.requireAuthRedirect = () => { /* no-op */ };
}
