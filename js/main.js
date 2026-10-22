// global variables -- to connect the superbase with this job-posting project
// const SUPABASE_URL = 'https://mflztvwlwcuwhhbviafh.supabase.co';
// const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_qG3mfirxgiVPVOsKe4BlmQ_Az470yyi';
// const db = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

//checkSession -- function to check session
async function checkSession(){

}

//function to signup email to supabase -- auth
async function signUpFunction(){
    const email = document.getElementById(signup-email).value.trim();
    const password = document.getElementById(signUp-password).value.trim();

    if( email == "" || password == ""){
        console.warn("Email or Password is empty");
        alter("Please, enter both email and password.");
        return;
    }

    //call supabase signup method
    let result = await db.auth.signUp({
        email: email,
        password: password,
    });

    let error = result.error;
    let data = result.data;

    if(error){
        alter("Sign Up Failed: " + error.message);
        console.warn("Sign-up failed !");
        return;
    }

    if(data){
        alter("Registration successfull: Please, check your email for confirmation.");
        console.log("Sign-up successfull: " + data);
    }

}