import React, { useState } from 'react';


function todayString() {
  const datetime = new Date()
  return datetime.toLocaleDateString('en-ca')
}

function InputTags({ tags, setTags }) {
  const removeTags = function (index) {
    setTags(tags.filter((tag) => tags.indexOf(tag) !== index))
  }
  return (
    <div>
      <ul>
        {tags.map((tag, index) => (
          <li key={index}>
            <span>{tag}</span>
            <i className="material-icons"
              onClick={() => removeTags(index)}>close</i>
          </li>
        ))}
      </ul>
      <input placeholder="press enter to add tags" onKeyUp={(event) => {
        if (event.key === "Enter" && event.target.value !== "") {
          setTags([...tags, event.target.value])
          event.target.value = ""
        }
      }} />
    </div>
  )
}

function InputForm({ addTransaction, updateTransaction, cancelAddOrEdit, initialData }) {
  const [date, setDate] = useState(initialData.date || todayString())
  const [amount, setAmount] = useState(initialData.amount || "")
  const [label, setLabel] = useState(initialData.label || "")
  const [tags, setTags] = useState(initialData.tags || [])
  return (
    <div className="input-form">
      <label>Amount:
      <input type="number" value={amount} onChange={(event) => {
        setAmount(event.target.value)
      }} /></label><br />
      <label>Label:
      <input value={label} onChange={(event) => {
        setLabel(event.target.value)
      }} /></label><br />
      <label>Date:
      <input type="date" value={date} onChange={(event) => {
        setDate(event.target.value)
      }} /></label><br />
      <InputTags tags={tags} setTags={setTags} />
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


export default InputForm;