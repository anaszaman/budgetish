import React, { useState } from 'react';
import './App.css';
import './InputForm.css'
import { Cancel } from '@material-ui/icons';

function todayString() {
  const datetime = new Date()
  return datetime.toLocaleDateString('en-ca')
}


const renderSuggestions = ({suggestions,onClickSuggestion,filterString}) => {
  const filteredSuggestions = suggestions.filter((suggestion) => suggestion.toLowerCase().indexOf(filterString) >= 0)
  if (filteredSuggestions.length === 0 || filterString.length === 0) {
    return;
  }
  return (<div className="suggestions"><ul>
      {filteredSuggestions.map((suggestion,index) => <li key={index} onClick={onClickSuggestion}>{suggestion}</li>)}
    </ul></div>)
}

function InputTags({ getExistingTags, tags, setTags }) {
  const [inputValue,setInputValue] = useState("")
  const removeTags = function (index) {
    setTags(tags.filter((tag) => tags.indexOf(tag) !== index))
  }

  const onClickSuggestion = (event) => {
    setTags([...tags, event.target.innerHTML])
    setInputValue("")
  }
  return (
    <div style={{color:"whitesmoke"}}>
      <ul>
        {tags.map((tag, index) => (
          <li key={index}>
            <span>{tag}</span>
            <Cancel className="material-icons"
              onClick={() => removeTags(index)}/>
          </li>
        ))}
      </ul>
      <input placeholder={inputValue.length === 0 ? "press enter to add tags" : null} value={inputValue.length !== 0 ? inputValue : ""} onKeyUp={(event) => {
        if (event.key === "Enter" && event.target.value !== "") {
          setTags([...tags, event.target.value])
          setInputValue("")
        }
      }}
      onChange={(event) =>
        setInputValue(event.target.value.trim().toLowerCase())
      }/>
      {renderSuggestions({suggestions:getExistingTags(), onClickSuggestion, filterString:inputValue})}
    </div>
  )
}


function InputForm({ getExistingTags,getExistingLabels,addTransaction, updateTransaction, cancelAddOrEdit, initialData }) {
  const [date, setDate] = useState(initialData.date || todayString())
  const [amount, setAmount] = useState(initialData.amount || "")
  const [label, setLabel] = useState(initialData.label || "")
  const [tags, setTags] = useState(initialData.tags || [])
  const onClickSuggestion = (event) => {
    setLabel(event.target.innerHTML);
  }
  return (
    <div className="input-form">
      <label>Amount:
      <input className="number-input" type="number" value={amount} onChange={(event) => {
        setAmount(event.target.value)
      }} /></label>
      <label>Label:
      <input value={label} onChange={(event) => {
        setLabel(event.target.value)
      }} />
      {renderSuggestions({suggestions:getExistingLabels(), onClickSuggestion, filterString:label.trim().toLowerCase()})}
      </label>
      <label>Date:
      <input type="date" value={date} onChange={(event) => {
        setDate(event.target.value)
      }} /></label>
      <InputTags getExistingTags={getExistingTags} tags={tags} setTags={setTags} />
      <button className="button" onClick={(event) => {
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
      <button className="button" onClick={cancelAddOrEdit}>cancel</button>
    </div>
  )
}


export default InputForm;