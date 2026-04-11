import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react"

type MotionOnlyProps = {
  initial?: unknown
  animate?: unknown
  exit?: unknown
  whileHover?: unknown
  whileTap?: unknown
  whileInView?: unknown
  viewport?: unknown
  transition?: unknown
  variants?: unknown
}

type WithChildren = {
  children?: ReactNode
}

function stripMotionProps<T extends MotionOnlyProps>(props: T) {
  const {
    initial,
    animate,
    exit,
    whileHover,
    whileTap,
    whileInView,
    viewport,
    transition,
    variants,
    ...rest
  } = props

  return rest
}

function Div(props: HTMLAttributes<HTMLDivElement> & MotionOnlyProps & WithChildren) {
  return <div {...stripMotionProps(props)} />
}

function H1(props: HTMLAttributes<HTMLHeadingElement> & MotionOnlyProps & WithChildren) {
  return <h1 {...stripMotionProps(props)} />
}

function P(props: HTMLAttributes<HTMLParagraphElement> & MotionOnlyProps & WithChildren) {
  return <p {...stripMotionProps(props)} />
}

function Span(props: HTMLAttributes<HTMLSpanElement> & MotionOnlyProps & WithChildren) {
  return <span {...stripMotionProps(props)} />
}

function Anchor(props: AnchorHTMLAttributes<HTMLAnchorElement> & MotionOnlyProps & WithChildren) {
  return <a {...stripMotionProps(props)} />
}

function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & MotionOnlyProps & WithChildren) {
  return <button {...stripMotionProps(props)} />
}

export const motion = {
  a: Anchor,
  button: Button,
  div: Div,
  h1: H1,
  p: P,
  span: Span,
}
