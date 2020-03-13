import React, {useState} from 'react';
import Files from 'react-files'
import './App.css';
import InputForm from './InputForm';
import { Cancel } from '@material-ui/icons';


function TransactionList({transactions,filterString,removeTransaction,editTransaction}) {
  const filteredTransactions = transactions.filter(({label,tags}) => 
    filterString.length === 0 || 
    label.toLowerCase().indexOf(filterString.toLowerCase()) >= 0 || tags.indexOf(filterString) >= 0
  )
  const listItems = filteredTransactions.map(({amount,label,date}, index) => {
    return (<tr className="transaction-row" key={index} onClick={editTransaction.bind(this,index)}>
      <td>{date}</td><td>{label}</td><td>${amount.toFixed(2)}</td>
      <td><button className="transaction-button" onClick={removeTransaction.bind(this, index)}>remove</button></td>
    </tr>)
  })
  return (
    <div className="transactions-section">
    <table className="transactions-table">
      <tbody><tr><th style={{width:"85px"}}>Date</th><th>Label</th><th>Amount</th></tr>
        {listItems}
      </tbody>
    </table>
    <input className="number-input" readOnly value={filteredTransactions.reduce((acc, {amount}) => acc+amount, 0).toFixed(2)} />
    </div>
  )
}

function ExportJSONButton({transactions,budgets,archives}) {
  return (
      <button className="button" onClick={async () => {
        const fileName = `transactions_${new Date().toLocaleDateString("en-ca")}`;
        const json = JSON.stringify({transactions,budgets,archives});
        const blob = new Blob([json],{type:'application/json'});
        const href = await URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = fileName + ".json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);        
      }}>Export Transactions</button>
  )
}

function ImportDropZone({setTransactions,setBudgets,setArchives}) {
  const fileReader = new FileReader();
  fileReader.onload = (event) => {
    const json = JSON.parse(event.target.result)
    json.transactions.sort((transaction, otherTransaction) => {
      if (transaction.date === otherTransaction.date) {
        return 0
      }
      if (transaction.date > otherTransaction.date) {
        return -1
      }

      return 1
    })
    setTransactions(json.transactions || [])
    setBudgets(json.budgets || [])
    setArchives(json.archives || [])
  }
  return (
      <button className="button"><Files type="file" clickable maxFiles={1}
      accepts={['.json']} 
      onChange={(files)=> {
        fileReader.readAsText(files[0]);
      }}>Import Transactions</Files></button>
  )
}

function FilterTotal({tags,index,budget,setBudgetTag,setBudgetAmount,removeBudget,getFilteredTotal}) {
  return (
    <tr key={index}>
      <td>
        <select className="tag-select" value={budget.tag} onChange={(event) => {
          setBudgetTag(index, event.target.value)
        }}><option key={-1} value=""></option>{tags.map((tag, tagIndex) => <option key={tagIndex} value={tag}>{tag}</option>)}</select>
      </td><td>
        <input className="number-input" type="number" value={budget.amount} onChange={(event) => {
          setBudgetAmount(index, parseFloat(event.target.value))
        }}/>
      </td>
      <td>${(budget.amount+getFilteredTotal(budget.tag)).toFixed(2)}</td>
      <td>
        <Cancel className="material-icons" style={{verticalAlign:"middle"}}
        onClick={() => removeBudget(index)}/>
      </td>
    </tr>
  )
}

function FilteredTotalsList({budgets,setBudgets,tags,getFilteredTotal}) {
  const addFilteredTotal = () => {
    const budget = {tag:"",amount:0}
    setBudgets([...budgets, budget])
  }
  const removeBudget = (index) => {
    setBudgets(
      budgets.filter((budget) => budgets.indexOf(budget) !== index)
    )
  }
  const listItems = budgets.map((budget,index) => 
    <FilterTotal 
      index={index}
      key={index} 
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
      getFilteredTotal={getFilteredTotal} 
      removeBudget={removeBudget}/>)
  return (
    <div className="budgets-section">
      <table className="budgets-table">
        <tbody>
          <tr><th>Category</th><th>Budgeted Amount</th><th>Leftover</th></tr>
        {listItems}
        <tr><td><button className="button" onClick={addFilteredTotal}>Add Budget Entry...</button></td></tr>
        </tbody>
      </table>
    </div>
  )
}

function firstOfTheMonth() {
  const date = new Date()
  date.setDate(1)
  return date.toLocaleDateString('en-ca')
}

function App({initialTransactions=[],initialBudgets=[],initialArchives=[]}) {
  const myTransactions = localStorage.getItem('myTransactions')
  if (myTransactions) {
    const parsedTransactions = JSON.parse(myTransactions)
    initialTransactions = parsedTransactions.length > 0 ? parsedTransactions : initialTransactions
  }
  const [transactions, setTransactions] = useState(initialTransactions)
  const [filterString,setFilter] = useState("")
  React.useEffect(() => {
    if (transactions) {
      localStorage.setItem('myTransactions', JSON.stringify(transactions));
    }
  }, [transactions])
  const myBudgets = localStorage.getItem('myBudgets')
  if (myBudgets) {
    const parsedBudgets = JSON.parse(myBudgets)
    initialBudgets = parsedBudgets.length > 0 ? parsedBudgets : initialBudgets
  }
  const [budgets,setBudgets] = useState(initialBudgets)
  React.useEffect(() => {
    if (budgets) {
      localStorage.setItem('myBudgets', JSON.stringify(budgets));
    }
  }, [budgets])
  
  const myArchives = localStorage.getItem('myArchives')
  if (myArchives) {
    const parsedArchives = JSON.parse(myArchives)
    initialArchives = parsedArchives.length > 0 ? parsedArchives : initialArchives
  }
  const [archives,setArchives] = useState(initialArchives)
  React.useEffect(() => {
    if (archives) {
      localStorage.setItem('myArchives', JSON.stringify(archives));
    }
  }, [archives])

  const cancelAddOrEdit = () => {
    setVisible(false)
    setInitial({})
  }
  const addTransaction = (transaction) => {
    setVisible(false)
    setTransactions([transaction, ...transactions])
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
  const getExistingTags = function() {
    return transactions.map(({tags}) => tags).reduce((acc, tags) => [...acc, ...tags.filter((tag) => acc.indexOf(tag) < 0)], [])
  }
  const getExistingLabels = function() {
    return transactions.map(({label}) => label).reduce((acc, label) => acc.indexOf(label) < 0 ? [...acc, label] : acc, [])
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
  const getPreviousMonths = () => {
    return transactions
      .filter((transaction) => transaction.date < firstOfTheMonth())
      .map(({date}) => {
        const [year,month] = date.split('-')
        return {year,month}
      })
      .reduce((acc,yearMonthObj) => acc.filter(({month,year}) => yearMonthObj.month === month && yearMonthObj.year === year).length ? acc : [...acc,yearMonthObj], [])
  }
  const collapseTransactions = function () {
    let newArchive = []
    for (const month of getPreviousMonths()) {
      const filteredTransactions = transactions.filter((transaction) => transaction.date.indexOf(`${month.year}-${month.month}`) === 0)
      const totalIncome = filteredTransactions.reduce((acc,{amount}) => amount > 0 ? acc+amount : acc, 0).toFixed(2)
      const totalExpenses = filteredTransactions.reduce((acc,{amount}) => amount < 0 ? acc+amount : acc, 0).toFixed(2)
      newArchive.push({month:`${month.year}-${month.month}`,income:totalIncome, expenses: totalExpenses})
    }
    return newArchive
  }
  const displayArchives = () => {
    const archivedMonths = collapseTransactions().map(({month,income,expenses},index) => <tr key={index}><td>{month}</td><td>${income}</td><td>${expenses}</td></tr>)
    return (<div><table><tbody><tr><th>Month</th><th>Income</th><th>Expenses</th></tr>{archivedMonths}</tbody></table></div>)
  }
  const [visibleForm, setVisible] = useState(false)
  const [initialData, setInitial] = useState({})
  const [visibleArchive, setVisibleArchive] = useState(false)
  if (visibleArchive) {
    return (
      <div className="budgetish-main">
        {displayArchives()}
        
        <button onClick={() => {
          setArchives([...archives,...collapseTransactions()])
          setTransactions(transactions.filter(({date}) => date >= firstOfTheMonth()))
          setVisibleArchive(false)
        }}>Commit Archive</button>
        <button onClick={() => setVisibleArchive(false)}>Cancel</button>
      </div>
    );
  }
  if (visibleForm) {
    return (
      <div className="budgetish-main">
          <InputForm existingTags={getExistingTags()} existingLabels={getExistingLabels()} addTransaction={addTransaction} updateTransaction={updateTransaction} cancelAddOrEdit={cancelAddOrEdit} initialData={initialData}/>
      </div>
    );
  }
  return (
    <div className="budgetish-main">
        <>
        <div style={{margin:"10px"}}>
          <input style={{width: "100%",height:"30px"}} placeholder="Filter transactions..." onChange={(event) => {
            setFilter(event.target.value)
          }}/>
        </div>
        {transactions.length > 0 && <TransactionList transactions={transactions} filterString={filterString} removeTransaction={removeTransaction} editTransaction={editTransaction}/>}
        </>
        <>
        {transactions.length > 0 && <FilteredTotalsList budgets={budgets} setBudgets={setBudgets} tags={getExistingTags()} getFilteredTotal={getTotalForBudgetTag}/>}
        </>
        <>
        <ExportJSONButton transactions={transactions} budgets={budgets} archives={archives}/>
        <ImportDropZone setTransactions={setTransactions} setBudgets={setBudgets} setArchives={setArchives}/>
        <button onClick={() => setVisibleArchive(true)}>Archive Past Transaction</button>
        </>
        <div className="add-button"><button onClick={() => setVisible(true)}>Add Transaction</button></div>
    </div>
  );
}

export default App;
