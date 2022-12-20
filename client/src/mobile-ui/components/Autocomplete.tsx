import { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import React from 'react'
import { InkDark } from '../ui-theme'

type AutocompleteProps = { options: string[] }
const Autocomplete = (props: AutocompleteProps) => {
  const { options } = props

  const [activeOption, setActiveOption] = useState(0)
  const [filteredOptions, setFilteredOptions] = useState<string[]>([])
  const [showOptions, setShowOptions] = useState(false)
  const [userInput, setUserInput] = useState('')

  const onChangeHandler: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      e => {
        const userInput = e.currentTarget.value

        if (userInput.length < 2) {
          setActiveOption(0)
          setFilteredOptions([])
          setShowOptions(true)
          setUserInput(e.currentTarget.value)
          return
        }

        const filteredOptions = options.filter(
          optionName =>
            optionName.toLowerCase().indexOf(userInput.toLowerCase()) > -1,
        )

        setActiveOption(0)
        setFilteredOptions(filteredOptions)
        setShowOptions(true)
        setUserInput(e.currentTarget.value)
      },
      [options],
    )

  const onClickHandler: React.MouseEventHandler<HTMLLIElement> = useCallback(
    e => {
      setActiveOption(0)
      setFilteredOptions([])
      setShowOptions(false)
      setUserInput(e.currentTarget.innerText)
    },
    [],
  )

  const onKeyDownHandler: React.KeyboardEventHandler<HTMLInputElement> =
    useCallback(
      e => {
        if (e.keyCode === 13) {
          setActiveOption(0)
          setShowOptions(false)
          setUserInput(filteredOptions[activeOption])
        } else if (e.keyCode === 38) {
          if (activeOption === 0) {
            return
          }
          setActiveOption(activeOption - 1)
        } else if (e.keyCode === 40) {
          if (activeOption === filteredOptions.length - 1) {
            console.log(activeOption)
            return
          }
          setActiveOption(activeOption + 1)
        }
      },
      [activeOption, filteredOptions],
    )

  let optionList
  if (showOptions && userInput) {
    if (filteredOptions.length) {
      optionList = (
        <ul className="options">
          {filteredOptions.map((optionName, index) => {
            let className
            if (index === activeOption) {
              className = 'option-active'
            }
            return (
              <li
                className={className}
                key={optionName}
                onClick={onClickHandler}>
                {optionName}
              </li>
            )
          })}
        </ul>
      )
    } else {
      optionList = (
        <div className="no-options">
          <em>No Option!</em>
        </div>
      )
    }
  }
  return (
    <React.Fragment>
      <div className="search">
        <input
          placeholder="Fly from"
          type="text"
          className="search-box"
          onChange={onChangeHandler}
          onKeyDown={onKeyDownHandler}
          value={userInput}
          style={{
            borderColor: InkDark,
            color: InkDark,
            padding: '8px 18px',
            borderRadius: 6,
          }}
        />
      </div>
      {optionList}
    </React.Fragment>
  )
}

Autocomplete.propTypes = {
  options: PropTypes.instanceOf(Array).isRequired,
}

export default Autocomplete
