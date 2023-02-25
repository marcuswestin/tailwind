import React, { useState, cloneElement, useEffect, useRef, ReactElement, useMemo } from 'react'
import { mergeRefs, interpolateStyle, sortAsc, AutocompleteOption } from './AutocompleteInput-utils'

export interface AutocompleteInputProps {
  options: string[] | AutocompleteOption[]
  // onValueChange: (value: string) => void
  onSelect(value: AutocompleteOption | null): void
  disableHint?: boolean
  children: ReactElement
  allowTabFill?: boolean
  allowEnterFill?: boolean
  onHint?(value: AutocompleteOption | undefined): void
  valueModifier?(value: string): string
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = props => {
  // React.ReactElement<any, string | React.JSXElementConstructor<any>>
  const child = React.Children.only(props.children)

  if (child.type?.toString()?.toLowerCase() !== 'input') {
    throw new TypeError(`react-autocomplete-hint: 'Hint' only accepts an 'input' element as child.`)
  }

  let optionsRef = useRef(props.options)

  useMemo(() => {
    if (typeof props.options[0] === 'string') {
      optionsRef.current = (optionsRef.current as string[]).map(option => ({
        id: option,
        label: option,
        value: option,
      }))

      let duplicates: Record<string, boolean> = {}
      optionsRef.current.forEach(option => {
        if (duplicates[option.id]) {
          throw new Error('Duplicate ID: ' + option.id)
        }
        duplicates[option.id] = true
      })
    }
  }, [props.options])

  const options = optionsRef.current as AutocompleteOption[]

  const { disableHint, allowTabFill, allowEnterFill, onSelect, onHint, valueModifier } = props

  const childProps = child.props

  let mainInputRef = useRef<HTMLInputElement>(null)
  let hintWrapperRef = useRef<HTMLSpanElement>(null)
  let hintRef = useRef<HTMLInputElement>(null)
  const [unModifiedInputText, setUnmodifiedInputText] = useState('')
  const [text, setText] = useState('')
  const [hint, setHint] = useState('')
  const [match, setMatch] = useState<AutocompleteOption>()
  const [matches, setMatches] = useState<AutocompleteOption[]>([])
  const [changeEvent, setChangeEvent] = useState<React.ChangeEvent<HTMLInputElement>>()
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (disableHint) {
      return
    }

    const inputStyle = mainInputRef.current && window.getComputedStyle(mainInputRef.current)
    inputStyle && styleHint(hintWrapperRef, hintRef, inputStyle)
  })

  const getMatches = (text: string) => {
    if (!text || text === '') {
      return
    }

    return options
      .filter(
        x =>
          x.label.toLowerCase() !== text.toLowerCase() &&
          x.label.toLowerCase().startsWith(text.toLowerCase()),
      )
      .sort((a, b) => sortAsc(a.label, b.label))
  }

  const setHintTextAndId = (text: string) => {
    setText(text)

    const matches = getMatches(text)
    let hint: string

    if (!matches || !matches[0]) {
      hint = ''
    } else {
      hint = matches[0].label.slice(text.length)
    }

    let match = matches?.[0]
    setHint(hint)
    setMatch(match)
    setMatches(matches || [])
    onHint && onHint(match)
  }

  const handleOnFill = () => {
    if (hint === '' || !changeEvent) {
      return
    }

    const newUnModifiedText = unModifiedInputText + hint
    changeEvent.target.value = newUnModifiedText

    setInputValue(newUnModifiedText)
  }
  const setInputValue = (newUnModifiedText: string) => {
    setHintTextAndId('')
    childProps.onChange && childProps.onChange(changeEvent)

    // props.onValueChange(newUnModifiedText)
    setUnmodifiedInputText(newUnModifiedText)
  }

  const styleHint = (
    hintWrapperRef: React.RefObject<HTMLSpanElement>,
    hintRef: React.RefObject<HTMLInputElement>,
    inputStyle: CSSStyleDeclaration,
  ) => {
    if (hintWrapperRef?.current?.style) {
      hintWrapperRef.current.style.fontFamily = inputStyle.fontFamily
      hintWrapperRef.current.style.fontSize = inputStyle.fontSize
      hintWrapperRef.current.style.width = inputStyle.width
      hintWrapperRef.current.style.height = inputStyle.height
      hintWrapperRef.current.style.lineHeight = inputStyle.lineHeight
      hintWrapperRef.current.style.boxSizing = inputStyle.boxSizing
      hintWrapperRef.current.style.margin = interpolateStyle(inputStyle, 'margin')
      hintWrapperRef.current.style.padding = interpolateStyle(inputStyle, 'padding')
      hintWrapperRef.current.style.borderStyle = interpolateStyle(inputStyle, 'border', 'style')
      hintWrapperRef.current.style.borderWidth = interpolateStyle(inputStyle, 'border', 'width')
    }

    if (hintRef?.current?.style) {
      hintRef.current.style.fontFamily = inputStyle.fontFamily
      hintRef.current.style.fontSize = inputStyle.fontSize
      hintRef.current.style.lineHeight = inputStyle.lineHeight
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChangeEvent(e)
    e.persist()

    // props.onValueChange(e.target.value)
    setUnmodifiedInputText(e.target.value)
    const modifiedValue = valueModifier ? valueModifier(e.target.value) : e.target.value
    setHintTextAndId(modifiedValue)

    onSelect(null)
    childProps.onChange && childProps.onChange(e)
  }

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setHintTextAndId(e.target.value)
    childProps.onFocus && childProps.onFocus(e)
  }

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    //Only blur it if the new focus isn't the the hint input
    if (hintRef?.current !== e.relatedTarget) {
      setHintTextAndId('')
      childProps.onBlur && childProps.onBlur(e)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const caretIsAtTextEnd = (() => {
      // For selectable input types ("text", "search"), only select the hint if
      // it's at the end of the input value. For non-selectable types ("email",
      // "number"), always select the hint.

      const isNonSelectableType = e.currentTarget.selectionEnd === null
      const caretIsAtTextEnd =
        isNonSelectableType || e.currentTarget.selectionEnd === e.currentTarget.value.length

      return caretIsAtTextEnd
    })()

    if (caretIsAtTextEnd && e.key === 'ArrowRight' && hint !== '') {
      handleOnFill()
      onSelect(match!)
    } else if (caretIsAtTextEnd && allowTabFill && e.key === 'Tab' && hint !== '') {
      // e.preventDefault()
      handleOnFill()
      onSelect(match!)
    } else if (caretIsAtTextEnd && allowEnterFill && e.key === 'Enter' && hint !== '') {
      e.preventDefault()
      handleOnFill()
      onSelect(match!)
    } else if (caretIsAtTextEnd && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && hint !== '') {
      e.preventDefault()
      setCurrentIndex(currentIndex + (e.key === 'ArrowDown' ? 1 : -1))
    }

    childProps.onKeyDown && childProps.onKeyDown(e)
  }

  const childRef = cloneElement(child as any).ref
  const mainInput = cloneElement(child, {
    ...childProps,
    onChange,
    onBlur,
    onFocus,
    onKeyDown,
    ref: childRef && typeof childRef !== 'string' ? mergeRefs(childRef, mainInputRef) : mainInputRef,
  })

  return (
    <div
      className="rah-input-wrapper"
      style={{
        position: 'relative',
      }}>
      {disableHint ? (
        child
      ) : (
        <>
          {mainInput}
          <span
            className="rah-hint-wrapper"
            ref={hintWrapperRef}
            style={{
              display: 'flex',
              pointerEvents: 'none',
              backgroundColor: 'transparent',
              borderColor: 'transparent',
              boxShadow: 'none',
              color: 'rgba(0, 0, 0, 0.35)',
              position: 'absolute',
              top: 0,
              left: 0,
            }}>
            <span
              className="rah-text-filler"
              style={{
                visibility: 'hidden',
                pointerEvents: 'none',
                whiteSpace: 'pre',
              }}>
              {text}
            </span>
            <input
              className="rah-hint"
              ref={hintRef}
              style={{
                pointerEvents: !hint || hint === '' ? 'none' : 'visible',
                background: 'transparent',
                width: '100%',
                outline: 'none',
                border: 'none',
                boxShadow: 'none',
                padding: 0,
                margin: 0,
                color: 'rgba(0, 0, 0, 0.30)',
                caretColor: 'transparent',
              }}
              defaultValue={hint}
              tabIndex={-1}
            />
          </span>

          <ul
            onMouseDown={e => e.preventDefault()}
            className="rah-matches"
            style={{ maxHeight: 200, overflowY: 'auto' }}>
            {matches?.map(match => (
              <li
                key={match.id}
                onClick={_ => {
                  // reuse the most recent change event
                  changeEvent!.target.value = match.label
                  setInputValue(match.label)
                  handleOnFill()
                  onSelect(match!)
                }}>
                {match.label}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default AutocompleteInput
