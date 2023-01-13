async function expense(e){
    e.preventDefault();

    const expenseDetails = {
      amount: e.target.amount.value,
      desc : e.target.desc.value,
      category: e.target.category.value
    }

    await axios.post("http://localhost:8080/add-expense", expenseDetails)
    .then(res=>{
        showExpenseOnScreen(res.data.newExpense);
    }).catch(err=>{
        console.log(err);
    })
}

window.addEventListener("DOMContentLoaded", async()=>{
    const token = localStorage.getItem('token');
    await axios.get("http://localhost:8080/get-expenses",{ headers: {"Authorization":token }})
    .then((response)=>{
        for(let i=0;i<response.data.expenses.length;i++){
            showExpenseOnScreen(response.data.expenses[i]);
        }
    })
    .catch(err=>{
        console.log(err);
    })
})

function showExpenseOnScreen(expense){
    const parentNode = document.getElementById('expenses');
    const childNode = `<li id= ${expense.id}> ${expense.amount} - ${expense.desc} - ${expense.category}
    <button onclick=editExpense('${expense.id}')> Edit </button>
    <button onclick=deleteExpense('${expense.id}')> Delete </button> </li>`;

    parentNode.innerHTML += childNode;
}

async function deleteExpense(id){
    await axios.delete(`http://localhost:8080/delete-expense/${id}`)
    .then((res) =>{
     removeExpenseFromScreen(id);
    })
    .catch(err=>{
     console.log(err);
    })
 }

 function removeExpenseFromScreen(id){
    const parentNode = document.getElementById('expenses');
    const childNodeToBeDeleted = document.getElementById(id);

    parentNode.removeChild(childNodeToBeDeleted);
}
