import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button component', () => {
  describe('rendering', () => {
    it('renders children text', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('renders as a <button> element', () => {
      render(<Button>Test</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('renders with default primary variant classes', () => {
      render(<Button>Primary</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('bg-blue-600')
    })

    it('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('bg-gray-100')
    })

    it('renders danger variant', () => {
      render(<Button variant="danger">Danger</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('bg-red-600')
    })

    it('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('bg-transparent')
    })
  })

  describe('sizes', () => {
    it('renders small size', () => {
      render(<Button size="sm">Small</Button>)
      expect(screen.getByRole('button').className).toContain('h-8')
    })

    it('renders medium size (default)', () => {
      render(<Button>Medium</Button>)
      expect(screen.getByRole('button').className).toContain('h-10')
    })

    it('renders large size', () => {
      render(<Button size="lg">Large</Button>)
      expect(screen.getByRole('button').className).toContain('h-12')
    })
  })

  describe('disabled state', () => {
    it('is not disabled by default', () => {
      render(<Button>Active</Button>)
      expect(screen.getByRole('button')).not.toBeDisabled()
    })

    it('is disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('does not fire onClick when disabled', () => {
      const onClick = jest.fn()
      render(<Button disabled onClick={onClick}>Disabled</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('loading state', () => {
    it('is disabled when loading is true', () => {
      render(<Button loading>Loading</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('renders spinner when loading', () => {
      render(<Button loading>Loading</Button>)
      // The spinner renders a div with animate-spin class
      const btn = screen.getByRole('button')
      const spinner = btn.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('does not render spinner when not loading', () => {
      render(<Button>Not Loading</Button>)
      const btn = screen.getByRole('button')
      expect(btn.querySelector('.animate-spin')).toBeNull()
    })

    it('still renders children text alongside spinner', () => {
      render(<Button loading>Loading Text</Button>)
      expect(screen.getByText('Loading Text')).toBeInTheDocument()
    })
  })

  describe('event handling', () => {
    it('calls onClick when clicked', () => {
      const onClick = jest.fn()
      render(<Button onClick={onClick}>Click</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('passes additional HTML button props', () => {
      render(<Button type="submit" data-testid="submit-btn">Submit</Button>)
      const btn = screen.getByTestId('submit-btn')
      expect(btn).toHaveAttribute('type', 'submit')
    })
  })

  describe('custom className', () => {
    it('merges custom className with variant classes', () => {
      render(<Button className="custom-class">Custom</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('custom-class')
      expect(btn.className).toContain('bg-blue-600')
    })
  })

  describe('ref forwarding', () => {
    it('forwards ref to the button element', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Button ref={ref}>Ref Button</Button>)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
      expect(ref.current?.tagName).toBe('BUTTON')
    })
  })

  describe('displayName', () => {
    it('has displayName "Button"', () => {
      expect(Button.displayName).toBe('Button')
    })
  })
})
