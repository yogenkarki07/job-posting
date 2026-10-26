//sign-up form variables
const signupForm = document.getElementById("form");
const inputEmail = document.getElementById("signup-email");
const inputPassword = document.getElementById("signup-password");
const signupButton = document.getElementById("signup-btn");
const signupMessage = document.getElementById("signup-message");

//user-status variables
const userEmail = document.getElementById("semail");
const userStatus = document.getElementById("sstatus");
const userID = document.getElementById("suid");
const userValidUntil = document.getElementById("svalid");

//updateUserStatus function -- to check whether a user is signed up or not
function updateUserStatus(user, session) {
  if (!user) {
    userEmail.textContent = "Email: None";
    userStatus.textContent = "Status: Not authenticated";
    userID.textContent = "UID: None";
    userValidUntil.textContent = "Valid Unit: --";
    return;
  }

  userEmail.textContent = `Email: ${user.email ?? "Not available"}`;
  userID.textContent = `UID: ${user.id}`;
  // userStatus.textContent = `Status: ${session ? "Authenticated" : "Email confirmation required / No active session"}`;

  //check whether session exist
  if (session && session.expires_at) {
    userStatus.textContent = "Status: Authenticated";

    const expiryDate = new Date(session.expires_at * 1000);

    userValidUntil.textContent = `Valid Until: ${expiryDate.toLocaleString()}`;

    return;
  } else{
    userStatus.textContent = "Status: Not authenticated";
    userValidUntil.textContent = "Valid Until: --";
  }

  //check email confirmation
  if(!user.email_confirmed_at){
    userStatus.textContent = "Status: email confirmation pending";
  }else{
    userStatus.textContent= "Status: registered, not signed in";
  }

}

//function to signup email to supabase -- Handle Sign Up
async function handleSignUp(event) {
  event.preventDefault(); //prevent page reload
  console.log("signup form submitted !!");
  const email = inputEmail.value.trim();
  const password = inputPassword.value;
  console.log("email entered !");
  signupButton.disabled = true; //disabled signedup button
  signupMessage.textContent = "Creating your account...";

  try {
    console.log("Sending signup signal to supabase !");
    //call supabase signup method
    const { data, error } = await db.auth.signUp({
      email: email,
      password: password
    });

    console.log("Signup supabase signal received.");

    if (error) {
      signupMessage.textContent = `Signup Error: ${error.message}`;
      console.error("Signup error: ", error.message);
      return;
    }

      //check whether session exist
    if (data.session) {
      signupMessage.textContent =
        "Account created successfully. You are signed in.";

      updateUserStatus(
        data.user, 
        data.session
      );

    } else {
      signupMessage.textContent =
        "Account created successfully. Please check your email and confirm your account.";

      updateUserStatus(data.user, null);

      console.log("Signup response:", data);
    }
  } catch (error) {                  //catch unexpected errors
    signupMessage.textContent =
      "An unexpected error occured. Please try again.";
    console.error("Unexpected signup error", error);
  } finally {
    signupButton.disabled = false; //enabled signup button
  }
}

//connect signup button to signup form
signupForm.addEventListener(
  "submit", 
  handleSignUp
);

//checkSession function -- check the current authentication session
async function checkSession() {

  const { data, error } = await db.auth.getSession();

  if (error) {
    signupMessage.textContent =
      "Unable to retrieve the authentication session.";

    updateUserStatus(null, null);

    console.error("Unable to retieve the authentication session.");
    return;
  }

  //get current session
  const session = data.session;

  updateUserStatus(
    session?.user ?? null, 
    session
  );

  console.log("session checked !!");
}

checkSession(); //initialize the user status

//authentication changes -- listeners
db.auth.onAuthStateChange((event, session) => {
  updateUserStatus(
    session?.user ?? null, 
    session
  );
  console.log("Authentication event:", event);
});
