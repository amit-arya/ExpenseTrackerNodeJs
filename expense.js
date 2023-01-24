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

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function showPremuimUser() {
    document.getElementById('rzp-btn').remove();
    const premiumUser = document.getElementById('premiumUser');
    premiumUser.innerHTML += `<div style="color:blue">
    You are a Premium user now</div>`;
}

window.addEventListener("DOMContentLoaded", async () => {
    const decodeToken = parseJwt(token);
    const ispremiumuser = decodeToken.ispremiumuser;

    if (ispremiumuser) {
        showPremuimUser();
        showLeaderBoard();
        showDownloadBtn();
        expenseReports();
    }
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
    const childNode = `<li id= ${expense.id}>${expense.date} - ${expense.desc} - ${expense.category} - ${expense.amount}
    <button onclick=deleteExpense('${expense.id}')> Delete </button> </li>`;

    parentNode.innerHTML += childNode;
}

document.getElementById('logout').onclick = () => {
    window.location.href = "../login/login.html";
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
    const response = await axios.get('http://localhost:8080/purchase/premiummembership', { headers: { "Authorization": token } });

    var options = {
        "key": response.data.key_id,
        "order_id": response.data.order.id, // for one time payment
        "handler": async function (response) {
            const res = await axios.post('http://localhost:8080/purchase/updatetransactionstatus', {
                order_id: options.order_id,
                payment_id: response.razorpay_payment_id
            }, { headers: { "Authorization": token } })

            showPremuimUser();
            showLeaderBoard();
            showDownloadBtn();
            expenseReports();

            alert('You are a Premium User now')
            localStorage.setItem('token', res.data.token);
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

function showLeaderBoard() {
    const premiumUser = document.getElementById('premiumUser');
    premiumUser.innerHTML += `<button onclick=leaderBoard()>Show Leaderboard</button>`;
}

async function leaderBoard() {
    const userLeaderBoardArray = await axios.get('http://localhost:8080/premium/showLeaderBoard',
        { headers: { "Authorization": token } })

    var leaderBoardElem = document.getElementById('leaderboard');
    leaderBoardElem.innerHTML += `<h2>Leader Board</h2>`

    userLeaderBoardArray.data.forEach((userDetails) => {
        leaderBoardElem.innerHTML += `<li>Name - ${userDetails.name},
         Total Expense - ${userDetails.total_expense || 0} </li>`
    })
}

function showDownloadBtn() {
    const premiumUser = document.getElementById('premiumUser');
    premiumUser.innerHTML += `<button id="downloadReport">Download Report</button>`;
    document.getElementById('downloadReport').onclick = function (e) {
        axios.get('http://localhost:8080/premium/user/download', { headers: { 'Authorization': token } })
            .then((response) => {
                if (response.status === 200) {
                    var a = document.createElement("a");
                    a.href = response.data.fileURL;
                    a.download = 'myexpense.csv';
                    a.click();
                } else {
                    throw new Error(response.data.message);
                }
            })
            .catch((err) => {
                console.log(err);
            })
    }
}

function expenseReports() {
    const parentNode = document.getElementById('reports');
    parentNode.innerHTML += `<h2>Your downloaded reports</h2>`;
    parentNode.innerHTML += `Rows per page:<select name="rows_per_page" id="rows_per_page"
     onchange="pageSelect()">
    <option value="5">5</option>
    <option value="10">10</option>
    <option value="15">15</option>
    </select>`

    const limit = document.getElementById('rows_per_page').value;
    pageSelect(1, limit);
}

function pageSelect(page, limit) {
    console.log(page, limit)
    const parentNode = document.getElementById('reports');
    document.querySelectorAll('.reports').forEach(e => e.remove());

    axios.get(`http://localhost:8080/premium/user/reports?page=${page}&limit=${limit}`,
        { headers: { 'Authorization': token } })
        .then((response) => {
            let currentIndex = (page - 1) * limit;
            let totalItems = response.data.reports.count
            if (response.data.reports.rows.length > 0) {
                for (let i = 0; i < response.data.reports.rows.length; i++) {
                    let childNode = `<li class="reports"><a href="${response.data.reports.rows[i].URL}">
                    report${currentIndex + 1}</li>`
                    parentNode.innerHTML += childNode;
                    currentIndex++;
                }
            }

            if (Math.ceil(totalItems / limit) > 1) {
                for (let i = 0; i < Math.ceil(totalItems / limit); i++) {
                    let childNode = `<button class="reports" onclick=pageSelect('${i + 1}','${limit}')>
                    ${i + 1}</button>`
                    parentNode.innerHTML += childNode;
                }
            }
        }).catch((err) => {
            console.log(err);
        })
}