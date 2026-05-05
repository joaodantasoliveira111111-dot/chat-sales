'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="p-6 bg-[rgba(220,38,38,0.06)] border border-[rgba(220,38,38,0.15)] rounded-xl text-center">
          <p className="font-semibold text-[#081827]">Algo deu errado</p>
          <p className="text-sm text-[#35516B] mt-1">{this.state.error?.message || 'Erro inesperado'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="mt-4 px-4 py-2 text-sm font-semibold text-[#0B7CFF] bg-[rgba(11,124,255,0.08)] rounded-xl hover:bg-[rgba(11,124,255,0.12)] transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
