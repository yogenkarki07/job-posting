//gobal variables
const form = document.getElementById("form");
const jobInfoContainer = document.getElementById("job-info");
const jobPostStatus = document.getElementById("jobpost-status");

//supabase session
let currentSession = null;

//hides form until authentication is checked.
form.hidden = true;

//visibility job UI -- function
function updateJobFormUI(session) {
  //check whether user is authenticated
  const isAuthenticated = Boolean(session?.user);
  currentSession = session;

  if (isAuthenticated) {
    form.hidden = false;
    console.log("User authenticated. Job form is revealed !");
  } else {
    form.hidden = true;
    console.log("User not authenticated. job form is hidden.");
  }
}

//checkUserAuthentication -- function to check authenticated user
//checkSession -- similar to function
async function checkUserAuthentication() {
  try {
    //retrieve the current supabase session
    const { data, error } = await db.auth.getSession();

    if (error) {
      console.error("Authentication error. ", error);
      updateJobFormUI(null);
      return;
    }

    const session = data.session;

    //update jobForm UI
    updateJobFormUI(session);

    console.log("Authenication checked.");
  } catch {
    console.error("Unexpected Authentication error occured: ", error.message);
    updateJobFormUI(null);
  }
}

checkUserAuthentication(); //initialized function

//Auth changes listeners
db.auth.onAuthStateChange((event, session) => {
  console.log("Authenication event.", event);
  try {
    updateJobFormUI(session);

    //refresh job listings after authentication changes
    setTimeout( () => {
      loadJobs();
    }, 0);
    
  } catch {
    console.error("Authentication error.", error);
  }
});

//getJobDetails -- get input details from form
function getJobDetails() {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const min = document.getElementById("salary-min").value;
  const max = document.getElementById("salary-max").value;
  const date = document.getElementById("date").value;
  const city = document.getElementById("city").value.trim();

  return {
    title,
    description,
    min,
    max,
    date,
    city
  };
}

//display jobstatus message
function setStatus(status, details = "") {
  jobPostStatus.innerText = details ? `$(status): $(details)` : status;
}

//postJobs function -- function for jobpost and supabase
async function postJobs() {
  //check session
  if (!currentSession?.user) {
    setStatus("Please sign-in before posting a job.");
    console.log("Please skign-in before posting a job.");
    return;
  }

  //can call variables inside getJobDetails() through variable job.
  const job = getJobDetails();

  if (job.min < o || job.max < 0) {
    setStatus("Salary cannot be negative.");
    console.log("Salary cannot be negative.");
    return;
  }

  if (job.min > job.max) {
    setStatus("Minimum salary must be higher than maximum salary.");
    console.log("Minimun salary must be higher than maximum salary.");
    return;
  }

  try {
    const post = document.getElementById("post");

    post.disabled = true;
    setStatus("Posting your job...");

    // insert jobs into database
    const { error } = await db
    .from("job-infos")
    .insert({
      title: job.title,
      description: job.description,
      salary_min: job.min,
      salary_max: job.max,
      start_date: job.date,
      city: job.city,
      created_by: user_id,
    })
    .select
    .single();

    if (error) {
      setStatus("Failed", error.message);
      console.error("Failed", error.message);
      return;
    }

    console.log("Job posted successfully.");
    
    //resets the forms
    form.reset();

    // reload the job FileList, when new job is posted
    await loadJobs();

  } catch (error) {

    console.error("Unexpected error occured: ", error);
    setStatus("Unexpected error occured. Please try again.");

  } finally{
    post.disabled = false; 
  }

}

//click event -- calls postJobs() when user submits the form
form.addEventListener("submit", async function(event){
  event.preventDefault();
  await postJobs();
})

//retrieves existing jobs and display them on the websites 
async function loadJobs(){

  // const job = getJobDetails();

    try{
        const{data, error} = await db
        .from("job_infos")
        .select("*")
        .order("created_at", {ascending: false});

        if(error){
            console.error("Unable to load jobs: ", error.message);
            jobInfoContainer.textContent("Unable to load jobs.");
            return;
        }

        //remove previously displayed job cards
        jobInfoContainer.replaceChild();

        //check whether database returns any jobs
        if(!data || data.length === 0){
          jobInfoContainer.textContent("No jobs are available at the moment.");
          console.log("No jobs are available at the moment.");
          return;
        }

        //loop through every retrieve data from database
        data.forEach((job) => {
          //create job card
          const jobCard = document.createElement("article");
          jobCard.classList.add("job-card");

          //job title
          const jobTitle = document.createElement("h3");
          jobTitle.textContent = job.title;

          //job description
          const jobDescription = document.createElement("p");
          jobDescription.textContent = job.description;

          //job salary
          const jobSalary = document.createElement("P");
          jobSalary.textContent = `Salary: ${job.salary_min} - ${job.salary_max}`;

          //job date
          const jobDate = document.createElement("p");
          jobDate.textContent = `Start date: ${job.date}`;

          //job_city
          const jobCity = document.createElement("p");
          jobCity.textContent = `City: ${job.city}`;

          //add all job details inside the jobCard
          jobCard.append(
            jobTitle,
            jobDescription,
            jobSalary,
            jobDate,
            jobCity
          );

          //added the jobCard into webpage
          jobInfoContainer.appendChild("jobCard");

        });

        console.log("Job loading successfully...");

    }catch(error){

        console.error("Unexpected error loading jobs: ", error.message);

    }
}

//check authentication and load jobs listenings
//initializePage -- functioj
async function initializePage(){

  //check authentication
  await checkUserAuthentication();

  //loadJobs
  await loadJobs();
}

initializePage();  // initialize -- start the application