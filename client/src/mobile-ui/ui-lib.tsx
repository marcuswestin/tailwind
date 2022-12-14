import { InkDark, CanvasMedium } from './ui-theme'

function makeWritableCopy<T extends {} | null>(
  obj: T,
  additionalProps?: T,
): NonNullable<T> {
  return { ...obj, ...additionalProps } as NonNullable<T>
}

type ElementProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>
type ElementStyle = ElementProps['style']

export function makeBoxView(styles: ElementStyle) {
  return function (props: ElementProps) {
    props = makeWritableCopy(props)
    if (!props.style) {
      Object.assign(props, { style: styles })
    } else {
      Object.assign(props, { style: { ...styles, ...props.style } })
    }
    return <div {...props} />
  }
}

export const Row = makeBoxView({
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'nowrap',
  flexGrow: 1,
} as ElementStyle)

export const Col = makeBoxView({
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
  flexGrow: 1,
} as ElementStyle)

export const Box = makeBoxView({
  display: 'flex',
  flexWrap: 'nowrap',
} as ElementStyle)

export const Screen = makeBoxView({
  height: '100%',
  textAlign: 'center',
  justifyContent: 'center',
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'nowrap',
})

export const Button = (
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >,
) => {
  let styles = Object.assign({}, props.style, {
    marginTop: 'auto',
    background: InkDark,
    color: CanvasMedium,
    width: '100%',
    borderRadius: 4,
    justifyContent: 'center',
  })
  return <button {...props} style={styles} />
}
