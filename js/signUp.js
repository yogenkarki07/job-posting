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
function updateUserStatus(user, session){
  if(!user){
    userEmail.textContent = "Email: None";
    userStatus.textContent = "Status: None";
    userID.textContent = "UID: None";
    userValidUntil.textContent = "Valid Unit: --";
    return;
  }

  userEmail.textContent = `Email: ${user.email ?? "Not available"}`;
  userStatus.textContent = `Status: ${session ? "Authenticated" : "Email confirmation required / No active session"}`;
  userID.textContent = `UID: ${user.id}`;

  if(session?.expires_at){
    const expiryDate = new Date(
      session?.expires_at * 1000
    );
    userValidUntil.textContent = `Valid Until: ${expiryDate.toLocalString()}`;
  }else{
    userValidUntil.textContent = "Valid Until: No  session";
  }
}

//function to signup email to supabase -- Handle Sign Up
async function handleSignUp() {
  preventDefault();
  const email = inputEmail.value.trim();
  const password = inputPassword.value;
  signupButton.disabled = true;
  signupMessage.textContent = "Creating your account...";

  try {
    //call supabase signup method
    const { data, error } = await db.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      signupMessage.textContext = `"Signup Error: ", ${error.message}`;
      console.error("Signup error: ", error.message);
      return;
    }

    if (data.session) {
      signupMessage.textContent =
        "Account created successfully. You are signed in.";
      updateUserStatus(
        data.user,
        data.session
      );
    } else {
      signupMessage.textContent =
        "Signup request completed. Check your email for confirmation code.";
        updateUserStatus(
          data.user,
          null
        );
      console.log("Signup response:", data);
    }
  } catch (error) {
    signupMessage.textContent =
      "An unexpected error occured. Please try again.";
    console.error("Unexpected signup error", error);
  } finally {
    signupButton.disabled = false;
  }
}

//checkSession function -- check the current authentication session
async function checkSession(){
  const{data, error} = await db.auth.getSession();
  if(error){
    signupMessage.textContent = "Unable to retrieve the authentication session.";
    alert("Unable to retieve the authentication session.");
    console.error("");
    return;
  }

  const session = data.session;

  updateUserStatus(
    session?.user ?? null,
    session
  );

}

checkSession();  //initialize the user status


