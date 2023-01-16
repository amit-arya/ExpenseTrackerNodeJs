async function forgotpassword(e){
    e.preventDefault();

    const email = {email: e.target.email.value};

    try{
        const result = await axios.post("http://localhost:8080/password/forgotpassword", email);
    } 
    catch(err){
        console.log(err);
    }
}