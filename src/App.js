import React, {useState} from 'react';
import Files from 'react-files'
import './App.css';
import InputForm from './InputForm';


function TransactionList({transactions,filterString,removeTransaction,editTransaction}) {
  const filteredTransactions = transactions.filter(({label,tags}) => 
    filterString.length === 0 || 
    label.indexOf(filterString) >= 0 || tags.indexOf(filterString) >= 0
  )
  const listItems = filteredTransactions.map(({amount,label,date}, index) => {
    return (<tr className="transaction-row" key={index}>
      <td>{date}</td><td>{label}</td><td>${amount.toFixed(2)}</td>
      <td><button className="button transaction-button" onClick={editTransaction.bind(this,index)}>edit</button>
      <button className="button transaction-button" onClick={removeTransaction.bind(this, index)}>remove</button></td>
    </tr>)
  })
  return (
    <div className="transactions-table">
    <table >
      <tbody><tr><th>Date</th><th>Label</th><th>Amount</th></tr>
        {listItems}
      </tbody>
    </table>
    <input readOnly value={filteredTransactions.reduce((acc, {amount}) => acc+amount, 0).toFixed(2)} /> 
    </div>
  )
}

function ExportJSONButton({transactions,budgets}) {
  return (
    <div>
      <button className="button" onClick={async () => {
        const fileName = "transactions";
        const json = JSON.stringify({transactions,budgets});
        const blob = new Blob([json],{type:'application/json'});
        const href = await URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = fileName + ".json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);        
      }}>Export Transactions</button>
    </div>
  )
}

function ImportDropZone({setTransactions,setBudgets}) {
  const fileReader = new FileReader();
  fileReader.onload = (event) => {
    const json = JSON.parse(event.target.result)
    json.transactions.sort((transaction, otherTransaction) => {
      if (transaction.date === otherTransaction.date) {
        return 0
      }
      if (transaction.date < otherTransaction.date) {
        return -1
      }

      return 1
    })
    setTransactions(json.transactions)
    setBudgets(json.budgets)
  }
  return (
    <div>
      <button className="button"><Files type="file" clickable maxFiles={1}
      accepts={['.json']} 
      onChange={(files)=> {
        fileReader.readAsText(files[0]);
      }}>Import Transactions</Files></button>
    </div>
  )
}

function FilterTotal({tags,index,budget,setBudgetTag,setBudgetAmount,getFilteredTotal}) {
  return (
    <div>
      <select className="button" value={budget.tag} onChange={(event) => {
        setBudgetTag(index, event.target.value)
      }}><option key={-1} value=""></option>{tags.map((tag, index) => <option key={index} value={tag}>{tag}</option>)}</select>
      <label>Budget:
        <input type="number" value={budget.amount} onChange={(event) => {
          setBudgetAmount(index, parseFloat(event.target.value))
        }}/></label>${(budget.amount+getFilteredTotal(budget.tag)).toFixed(2)}
    </div>
  )
}

function FilteredTotalsList({budgets,setBudgets,tags,getFilteredTotal}) {
  const addFilteredTotal = () => {
    const budget = {tag:"",amount:0}
    setBudgets([...budgets, budget])
  }
  const listItems = budgets.map((budget,index) => (<li key={index}>{
    <FilterTotal 
      index={index} 
      tags={tags}
      budget={budget}
      setBudgetTag={(index,tag) => {
        const budget = budgets[index]
        budget.tag = tag
        setBudgets([...budgets.slice(0, index), budget, ...budgets.slice(index+1)])
      }}
      setBudgetAmount={(index,amount) => {
        const budget = budgets[index]
        budget.amount = amount
        setBudgets([...budgets.slice(0, index), budget, ...budgets.slice(index+1)])
      }}
      getFilteredTotal={getFilteredTotal} />}</li>))
  return (
    <div>
      <ul>
        {listItems}
        <li><button className="button" onClick={addFilteredTotal}>Add Budget Entry...</button></li>
      </ul>
    </div>
  )
}

function firstOfTheMonth() {
  const date = new Date()
  date.setDate(1)
  return date.toLocaleDateString('en-ca')
}

function App({initialTransactions=[],initialBudgets=[]}) {
  const myTransactions = localStorage.getItem('myTransactions')
  const [transactions, setTransactions] = useState(
    myTransactions && myTransactions.length > 0 ? JSON.parse(myTransactions) : initialTransactions
  )
  const [filterString,setFilter] = useState("")
  React.useEffect(() => {
    if (transactions && transactions.length > 0) {
      localStorage.setItem('myTransactions', JSON.stringify(transactions));
    }
  }, [transactions])
  const myBudgets = localStorage.getItem('myBudgets')
  const [budgets,setBudgets] = useState(myBudgets && myBudgets.length > 0 ? JSON.parse(myBudgets) : initialBudgets)

  React.useEffect(() => {
    if (budgets && budgets.length > 0) {
      localStorage.setItem('myBudgets', JSON.stringify(budgets));
    }
  }, [budgets])
  const cancelAddOrEdit = () => {
    setVisible(false)
    setInitial({})
  }
  const addTransaction = (transaction) => {
    setVisible(false)
    setTransactions([...transactions,transaction])
  }
  const updateTransaction = function (index, transaction) {
    setVisible(false)
    setInitial({})
    setTransactions([...transactions.slice(0, index), transaction, ...transactions.slice(index+1)])
  }
  const removeTransaction = function(index) {
    console.log(JSON.stringify(index))
    setTransactions(
      transactions.filter((transaction) => transactions.indexOf(transaction) !== index)
    )
  }
  const getAllTags = function() {
    return transactions.map(({tags}) => tags).reduce((acc, tags) => [...acc, ...tags.filter((tag) => acc.indexOf(tag) < 0)], [])
  }
  const editTransaction = function(index) {
    console.log(JSON.stringify(index))
    setInitial({...transactions[index], index:index})
    setVisible(true)
  }
  const getTotalForBudgetTag = function (tag) {
    // filter by tag and only transactions from the current month
    return transactions.filter((transaction) => transaction.tags.indexOf(tag) >= 0).filter((transaction) => transaction.date >= firstOfTheMonth()).reduce((acc,{amount}) => acc+amount, 0)
  }
  const [visibleForm, setVisible] = useState(false)
  const [initialData, setInitial] = useState({})
  return (
    <div className="todoListMain">
        {visibleForm && <InputForm addTransaction={addTransaction} updateTransaction={updateTransaction} cancelAddOrEdit={cancelAddOrEdit} initialData={initialData}/>}
        {!visibleForm && <button className="button add-button" onClick={() => setVisible(true)}>Add Transaction</button>}
        <div>
          <input placeholder="Filter transactions..." onChange={(event) => {
            setFilter(event.target.value)
          }}/>
        </div>
        {transactions.length > 0 && <TransactionList transactions={transactions} filterString={filterString} removeTransaction={removeTransaction} editTransaction={editTransaction}/>}
        <FilteredTotalsList budgets={budgets} setBudgets={setBudgets} tags={getAllTags()} getFilteredTotal={getTotalForBudgetTag}/>
        <ExportJSONButton transactions={transactions} budgets={budgets}/>
        <ImportDropZone setTransactions={setTransactions} setBudgets={setBudgets}/>
    </div>
  );
}

export default App;
