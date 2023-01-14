const token = localStorage.getItem('token');

async function expense(e) {
    e.preventDefault();

    const expenseDetails = {
        amount: e.target.amount.value,
        desc: e.target.desc.value,
        category: e.target.category.value
    }

    await axios.post("http://localhost:8080/add-expense", expenseDetails, { headers: { "Authorization": token } })
        .then(res => {
            showExpenseOnScreen(res.data.newExpense);
        }).catch(err => {
            console.log(err);
        })
}

window.addEventListener("DOMContentLoaded", async () => {
    await axios.get("http://localhost:8080/get-expenses", { headers: { "Authorization": token } })
        .then((response) => {
            for (let i = 0; i < response.data.expenses.length; i++) {
                showExpenseOnScreen(response.data.expenses[i]);
            }
        })
        .catch(err => {
            console.log(err);
        })
})

function showExpenseOnScreen(expense) {
    const parentNode = document.getElementById('expenses');
    const childNode = `<li id= ${expense.id}> ${expense.amount} - ${expense.desc} - ${expense.category}
    <button onclick=editExpense('${expense.id}')> Edit </button>
    <button onclick=deleteExpense('${expense.id}')> Delete </button> </li>`;

    parentNode.innerHTML += childNode;
}

async function deleteExpense(id) {
    await axios.delete(`http://localhost:8080/delete-expense/${id}`, { headers: { "Authorization": token } })
        .then((res) => {
            removeExpenseFromScreen(id);
        })
        .catch(err => {
            console.log(err);
        })
}

function removeExpenseFromScreen(id) {
    const parentNode = document.getElementById('expenses');
    const childNodeToBeDeleted = document.getElementById(id);

    parentNode.removeChild(childNodeToBeDeleted);
}

document.getElementById('rzp-btn').onclick = async function (e) {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:8080/purchase/premiummembership', { headers: { "Authorization": token } });

    var options = {
        "key": response.data.key_id,
        "order_id": response.data.order.id, // for one time payment
        "handler": async function (response) {
            await axios.post('http://localhost:8080/purchase/updatetransactionstatus', {
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id
            }, { headers: { "Authorization": token } })

            document.getElementById('rzp-btn').remove();
            const premiumUser = document.getElementById('premiumUser');
            premiumUser.innerHTML += `<div style="color:blue">
            You are a Premium user now</div>`;

            alert('You are a Premium User now')
        },
    }

    const rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();

    rzp1.on('payment.failed', function (response) {
        console.log(response);
        alert('Transaction failed');
    })
}