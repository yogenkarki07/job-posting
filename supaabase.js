const SUPABASE_URL = 'https://mflztvwlwcuwhhbviafh.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_qG3mfirxgiVPVOsKe4BlmQ_Az470yyi';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);


async function loadCountry (){
    const country = document.getElementById('country');

    const result = await db
    .from ('countries')
    .select ('name','code')
    .order('name');

    let data = result.data;
    let error = result.data;

    if(error){
        country.innerHTML = '<option value=""> Countries unavailable </option>';
        console.log('COuldnot load data', error.message);
        return;
    }

    country.innerHTML = '<option value=""> choose your country </option>';

    data.forEach(function(row){
        const option = document.createElement('option');
        option.value = row.code;
        option.textContent = row.name;
        country.append(option);
    });
}