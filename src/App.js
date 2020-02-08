import React, {useState} from 'react';
import Files from 'react-files'


function List({transactions,filterString,removeTransaction,editTransaction}) {
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

function InputTags({tags, setTags}) {
  const removeTags = function (index) {
    setTags(tags.filter((tag) => tags.indexOf(tag) !== index))
  }
  return (
    <div>
    <ul>
      {tags.map((tag,index) => (
        <li key={index}>
          <span>{tag}</span>
          <i className="material-icons"
          onClick={() => removeTags(index)}>close</i>
        </li>
      ))}
    </ul>
    <input placeholder="press enter to add tags" onKeyUp={(event) => {
      if (event.key ==="Enter" && event.target.value !== "") {
        setTags([...tags, event.target.value])
        event.target.value = ""
      }
    }}/>
    </div>
  )
}

function InputForm({addTransaction,updateTransaction,cancelAddOrEdit,initialData}) {
    const [date, setDate] = useState(initialData.date || todayString())
    const [amount, setAmount] = useState(initialData.amount || "")
    const [label, setLabel] = useState(initialData.label || "")
    const [tags, setTags] = useState(initialData.tags || [])
  return (
    <div className="header">
      <label>Amount:</label>
      <input value={amount} onChange={(event) => {
        setAmount(event.target.value)
      }}/><br/>
      <label>Label:</label>
      <input value={label} onChange={(event) => {
        setLabel(event.target.value)
      }}/><br/>
      <label>Date:</label>
      <input type="date" value={date} onChange={(event) => {
        setDate(event.target.value)
      }}/><br/>
      <InputTags tags={tags} setTags={setTags}/>
      <button onClick={(event) => {
        if (amount === "" || isNaN(amount)) {
          event.preventDefault()
          setAmount("")
          return
        }
        const transaction = {
          "amount": parseFloat(amount),
          "label": label,
          "date": date,
          "tags": tags,
        }
        if (initialData.index) {
          updateTransaction(initialData.index, transaction)
        }
        else {
          addTransaction(transaction)
        }
        event.preventDefault()
        setAmount("")
      }}>{initialData.index !== undefined ? "update" : "add"}</button>
      <button onClick={cancelAddOrEdit}>cancel</button>
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

function todayString() {
  const datetime = new Date()
  return datetime.toLocaleDateString('en-ca')
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

function App() {
  const myTransactions = localStorage.getItem('myTransactions')
  const [transactions, setTransactions] = useState(
    myTransactions ? JSON.parse(myTransactions) : []
  )
  const [filterString,setFilter] = useState("")
  React.useEffect(() => {
    localStorage.setItem('myTransactions', JSON.stringify(transactions));
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
        <List transactions={transactions} filterString={filterString} removeTransaction={removeTransaction} editTransaction={editTransaction}/>
        <FilterTotal tags={getAllTags()} getTotal={getTotalForBudgetTag}/>
        <ExportJSONButton transactions={transactions}/>
        <ImportDropZone setTransactions={setTransactions}/>
    </div>
  );
}

export default App;
