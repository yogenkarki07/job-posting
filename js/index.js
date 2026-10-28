//gobal variables
const form = document.getElementById("form");

//hides form immediately when authentication is checked.
form.hidden = true;

//visibility job UI -- function
function updateJobFormUI(session){
    const isAuthenticated = Boolean(session?.user);

    if(isAuthenticated){
        form.hidden = false;
        console.log("Job form is revealed !");
    }else{
        form.hidden = true;
        console.log("job form is hidden.");
    }
}

//checkUserAuthentication -- function to check authenticated user
//checkSession -- similar to function
async function checkUserAuthentication(){

    const {data, error} = await db.auth.getSession();

    if(error){
        console.error("Authentication error. ", error);
        updateJobFormUI(null);
        return;
    }

    const session = data.session;

    //update jobForm UI
    updateJobFormUI(session);

    console.log("Authenication checked.");
}

checkUserAuthentication(); //initialized function

//Auth changes listeners
db.auth.onAuthStateChange((event, session) => {
    console.log("Authenication event.", event);
    try{
        updateJobFormUI(session);
    }catch{
        console.error("Authentication error.", error)
    }
});

//postJobs function -- function for jobpost and supabase
async function postJobs(){
    const{error} = await db.from('job-infos').insert({
        title: title,
        description: description,
        salary_min: min,
        salary_max: max,
        start_date: date,
        city: city,
        created_by: user_id
    });

    if(error){
        console.error("Failed", error.message);
        setStatus('Failed', error.message);
        return;
    }

    // reload the job FileList, when new job is posted
    await loadJobs(); 
}