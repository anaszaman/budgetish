import React, {useState} from 'react';
import Files from 'react-files'
import InputForm from './InputForm';


function TransactionList({transactions,filterString,removeTransaction,editTransaction}) {
  const filteredTransactions = transactions.filter(({label,tags}) => 
    filterString.length === 0 || 
    label.indexOf(filterString) >= 0 || tags.indexOf(filterString) >= 0
  )
  const listItems = filteredTransactions.map(({amount,label,date}, index) => {
    return (<tr key={index}>
      <td>{date}</td><td>{label}</td><td>${amount.toFixed(2)}</td>
      <td><button onClick={editTransaction.bind(this,index)}>edit</button><button onClick={removeTransaction.bind(this, index)}>remove</button></td>
    </tr>)
  })
  return (
    <div>
    <table>
      <tbody><tr><th>Date</th><th>Label</th><th>Amount</th></tr>
        {listItems}
      </tbody>
    </table>
    <input readOnly value={filteredTransactions.reduce((acc, {amount}) => acc+amount, 0).toFixed(2)} /> 
    </div>
  )
}

function ExportJSONButton({transactions}) {
  return (
    <div>
      <button onClick={async () => {
        const fileName = "transactions";
        const json = JSON.stringify({"transactions":transactions});
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

function ImportDropZone({setTransactions}) {
  const fileReader = new FileReader();
  fileReader.onload = (event) => {
    const json = JSON.parse(event.target.result)
    setTransactions(json.transactions)
  }
  return (
    <div>
      <button><Files type="file" clickable maxFiles={1}
      accepts={['.json']} 
      onChange={(file)=> {
        fileReader.readAsText(file[0]);
      }}>Import Transactions</Files></button>
    </div>
  )
}

function FilterTotal({tags,getTotal}) {
  const [total,setTotal] = useState(0)
  return (
    <div>
      <select onChange={(event) => {
        setTotal(getTotal(event.target.value))
      }}><option key={-1} value=""></option>{tags.map((tag, index) => <option key={index} value={tag}>{tag}</option>)}</select>
      ${total.toFixed(2)}
    </div>
  )
}

function App({initialTransactions=[]}) {
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
    return transactions.filter((transaction) => transaction.tags.indexOf(tag) >= 0).reduce((acc,{amount}) => acc+amount, 0)
  }
  const [visibleForm, setVisible] = useState(false)
  const [initialData, setInitial] = useState({})
  return (
    <div className="todoListMain">
        {visibleForm && <InputForm addTransaction={addTransaction} updateTransaction={updateTransaction} cancelAddOrEdit={cancelAddOrEdit} initialData={initialData}/>}
        {!visibleForm && <button onClick={() => setVisible(true)}>Add Transaction</button>}
        <div>
          <input placeholder="Filter transactions..." onChange={(event) => {
            setFilter(event.target.value)
          }}/>
        </div>
        {transactions.length > 0 && <TransactionList transactions={transactions} filterString={filterString} removeTransaction={removeTransaction} editTransaction={editTransaction}/>}
        <FilterTotal tags={getAllTags()} getTotal={getTotalForBudgetTag}/>
        <ExportJSONButton transactions={transactions}/>
        <ImportDropZone setTransactions={setTransactions}/>
    </div>
  );
}

export default App;
