async function signup(e){
  try{
     e.preventDefault();
     const signupDetails = {
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value
     }

     console.log(signupDetails);

     await axios.post('http://localhost:8080/user/signup', signupDetails)
     .then(res => {
        window.location.href = "/signup.html"
        document.body.innerHTML += 'signup successful'; 
     })
     .catch(err => {
        console.log(err);
     })
  } catch(err){
      document.body.innerHTML += err; 
  }
}