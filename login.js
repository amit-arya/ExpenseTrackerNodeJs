async function login(e){
    e.preventDefault();

    const loginDetails = {
        email: e.target.email.value,
        password: e.target.password.value
    }

    await axios.get("http://localhost:8080/get-users", loginDetails)
    .then((response)=>{
        for(let i=0;i<response.data.users.length;i++){
            if(response.data.users[i].email==loginDetails.email){
                if(response.data.users[i].password==loginDetails.password){
                    document.body.innerHTML += `<div style="color:blue">
                    Logged in successfully</div>`;
                }
                else{
                    document.body.innerHTML += `<div style="color:red">
                     Password does not match, try again</div>`;
                }
                break;
            }
        }
        // document.body.innerHTML += `<div style="color:blue">
        //              Logged in successfully</div>`;
    })
    .catch(err => {
        console.log(`${err}:<div style="color:red">
        User Not Found</div>`);
    })
}