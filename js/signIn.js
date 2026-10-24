//sign-in form variables
const signinForm = document.getElementById("sign-form");
const inputEmail = document.getElementById("signin-email");
const inputPassword = document.getElementById("signin-email");
const loginBtn = document.getElementById("signin-btn");
const message = document.getElementById("signin-message");

//user status -- variables
const userEmail = document.getElementById("uemail");
const userStatus = document.getElementById("ustatus");
const userID = document.getElementById("uuid");
const userValidUntil = document.getElementById("uvalid");

//userStatus -- function
function updateUserStatus(user, session){
    if(!user){
        userEmail.textContent = "Email: None";
        userStatus.textContent = "Status: None";
        userID.textContent = "UID: None";
        userValidUntil.textContent = "Valid until: --";
    }

    userEmail.textContent = `Email: ${user.email ?? "availabel" }`;
    userID.textContent = `UID: ${user.uid}`;

    //to checck session
    if(session){
        userStatus.textContent = 'Status: Authenticated';
        const sessionExpiryDate = new Date(
            session.expires_at * 100
        );
        userValidUntil.textContent = `Valid until: ${sessionExpiryDate.toLocaleString}`
        console.log("session checked!");
        return;
    }else{
            userStatus.textContent = 'Status: Not authenticated';
            userValidUntil.textContent = "Valid until: --";
    }
}

    async function handleSignIn(event){
        event.preventDefault();
        console.log("signin submitted");

        const email = inputEmail.value.trim();
        const password = inputPassword.value;

        loginBtn.disabled = true;   //disabled signin button

        message.textContent = "Signing in ...";

        try{
            //call signin method from supabase
            const{data, error} = await db.auth.signInWithPassword({
                email: email,
                password: password
            });

            //check error
            if(error){
                message.textContent = `"Sign in failed: " ${error.message}`;
                console.error("signin failed: ", error.message);
                //user status remains constant if sign in failed.
                updateUserStatus(null, null);
                return;
            }

            //signin success
            console.log("signin success");

            message.textContent = "Sign in successfull. Welcome back !";

            //update user status
            updateUserStatus(
                data.user,
                data.session
            );

        }catch{
            //handles unexpexted error
            message.textContent = "Unexpected error occured. Please try again";
            console.error("Unexpected signin error", error);
        }finally{
            //signin button enabled
            loginBtn.disabled = false;
        }
    }

    //added eventlistner in sign-in
    signinForm.addEventListener(
        "submit", handleSignIn
    );

    //checkSession --- function of check/get session
    async function checkSession(){

        //get current supabase session
        const{data, error} = await db.auth.getSession();

        //check error
        if(error){
            message.textContent = "Failed to retrive authentication session ";
            console.error("Session failed: ", error)
            updateUserStatus(null, null);
            return;
        }

        //get session
        const session = data.session;

        //update user status
        updateUserStatus(
            session?.user ?? null,
            session
        );

        console.log("session checked !!");

    }

    checkSession(); //initialize the signin page (checkSession)

    // auth changes listners
    db.auth.onAuthStateChange((event, session) =>{

        console.log("Authentication event", event);

        updateUserStatus(
            session?.user ?? null,
            session
        );
    });