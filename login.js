async function login(e) {
    e.preventDefault();

    const loginDetails = {
        email: e.target.email.value,
        password: e.target.password.value
    }

    await axios.post("http://localhost:8080/get-user", loginDetails)
        .then(res => {
            document.body.innerHTML += `<div style="color:blue">
                     Logged in successfully</div>`;
        })
        .catch(err => {
            document.body.innerHTML += `<div style="color:red">
        User not found</div>`;
        })
}