async function login(e){
    e.preventDefault();

    const loginDetails = {
        name: e.target.name.value,
        password: e.target.password.value
    }

    let flag = false;

    await axios.get("http://localhost:8080/get-users")
    .then((response)=>{
        for(let i=0;i<response.data.users.length;i++){
            if(response.data.users[i].email==loginDetails.email){
                if(response.data.users[i].password==loginDetails.password){
                    flag = true;
                }
                else{
                    console.log('password does not match');
                }
                break;
            }
        }

        if(flag){
            console.log('User found');
        }
        else{
            console.log('User not found');
        }
    })
    .catch(err => {
        console.log(`some error occured ${err}`);
    })
}