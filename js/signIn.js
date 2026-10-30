//sign-in form variables
const signinForm = document.getElementById("form");
const inputEmail = document.getElementById("signin-email");
const inputPassword = document.getElementById("signin-password");
const loginBtn = document.getElementById("signin-btn");
const message = document.getElementById("signInSignOutMsg");
const logoutBtn = document.getElementById("signout-btn");

//user status -- variables
const userEmail = document.getElementById("uemail");
const userStatus = document.getElementById("ustatus");
const userID = document.getElementById("uuid");
const userValidUntil = document.getElementById("uvalid");

//userStatus -- function
function updateUserStatus(user, session) {
  if (!user) {
    userEmail.textContent = "Email: None";
    userStatus.textContent = "Status: None";
    userID.textContent = "UID: None";
    userValidUntil.textContent = "Valid until: --";
    return;
  }

  userEmail.textContent = `Email: ${user.email ?? "Not availabel"}`;
  userID.textContent = `UID: ${user.id ?? "Not available"}`;

  //to check session
  if (!session) {
    userStatus.textContent = "Status: Registered";
  }

  if (session && session.expires_at) {
    userStatus.textContent = "Status: Authenticated";

    const sessionExpiryDate = new Date(session.expires_at * 1000);

    userValidUntil.textContent = `Valid until: ${sessionExpiryDate.toLocaleString()}`;

    console.log("session checked!");

  } else {
    userStatus.textContent = "Status: Registered, but not authenticated";
    userValidUntil.textContent = "Valid until: No active session";
  }
}

async function handleSignIn(event) {
  event.preventDefault();
  console.log("signin submitted");

  const email = inputEmail.value.trim();
  const password = inputPassword.value;

  loginBtn.disabled = true; //disabled signin button

  message.textContent = "Signing in ...";

  try {
    //call signin method from supabase
    const { data, error } = await db.auth.signInWithPassword({
      email: email,
      password: password,
    });

    //check error
    if (error) {
      message.textContent = `"Sign-in failed: " ${error.message}`;
      console.error("sign-in failed: ", error.message);
      //user status remains constant if sign in failed.
      updateUserStatus(null, null);
      return;
    }

    //check session
    if (data.session && data.user) {
      message.innerHTML = `Sign in successfull. <a href="./index.html"> Click Here </a> to post jobs`;

      //update user status
      updateUserStatus(data.user, data.session)

      //update login/logout buttons
      signInSignOutButtons(data.session);

      //signin success
      console.log("sign-in successfull.");
    } else {
      message.textContent =
        "Sign-in completed, but no active session was returned.";
      updateUserStatus(data.user ?? null, null);
      signInSignOutButtons(null);
    }
  } catch {
    //handles unexpexted error
    message.textContent = "Unexpected error occured. Please try again";
    console.error("Unexpected sign-in error: ", error);
  } finally {
    //signin button enabled
    loginBtn.disabled = false;
  }
}

//added eventlistner in sign-in
signinForm.addEventListener("submit", handleSignIn);

//checkSession --- function of check/get session
async function checkSession() {
  try {
    //get current supabase session
    const { data, error } = await db.auth.getSession();

    //check error
    if (error) {
      message.textContent = "Failed to retrive authentication session ";
      console.error("Session failed: ", error);

      updateUserStatus(null, null);
      signInSignOutButtons(null);

      return;
    }

    //get session
    const session = data.session;

    //update user status
    updateUserStatus(session?.user ?? null, session);

    //update button
    signInSignOutButtons(session);

    if(session){
      message.innerHTML = `Sign in successfull. <a href="./index.html"> Click Here </a> to post jobs`;
      return;
    }

    console.log("session checked !!");
  } catch (error) {
    console.error("Unexpexted error occured: ", error);
    updateUserStatus(null, null);
    signInSignOutButtons(null);
  }
}

checkSession(); //initialize the signin page (checkSession)

// auth changes listners
db.auth.onAuthStateChange((event, session) => {
  console.log("Authentication event", event);

  try {

    updateUserStatus(session?.user ?? null, session);
    signInSignOutButtons(session);
    
    if(session?.user){
        message.innerHTML = `Sign in successfull. <a href="./index.html"> Click Here </a> to post jobs`;
        return;
      }
      
  } catch (error) {
    console.error("unable to update user status: ", error);
  }

});

//sign-out function
async function handleSignOut() {
  console.log("signout button clicked.");
  logoutBtn.disabled = true;
  message.textContent = "Signing out...";
  try {
    const { error } = await db.auth.signOut();

    //check error
    if (error) {
      message.textContent = `"Sign-out failed" ${error.message}`;
      console.error("Sign-out failed. ", error.message);
      return;
    }

    message.textContent = "Signout successfull";
    console.log("Signout successfull");

    //reset user status
    updateUserStatus(null, null);

    //update login/logout buttons
    signInSignOutButtons(null);

  } catch (error) {
    message.textContent = "Unexpected error occured during sign out. ";
    console.error("Unexpected error occured: ", error);
  } finally {
    logoutBtn.disabled = false;
  }
  console.log("signout success !!");
}

logoutBtn.addEventListener("click", handleSignOut);

//this function handles visibility of login and logout functions according to need
function signInSignOutButtons(session) {
  const isAuthenticated = Boolean(session);

  //login button
  loginBtn.style.display = isAuthenticated ? "none" : "inline-block";

  //signout button
  logoutBtn.style.display = isAuthenticated ? "inline-block" : "none";
}
