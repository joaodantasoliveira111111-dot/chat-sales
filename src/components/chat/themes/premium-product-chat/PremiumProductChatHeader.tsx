'use client'

import { PublicPage } from '@/types'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

interface PremiumProductChatHeaderProps {
  page: PublicPage
}

export function PremiumProductChatHeader({ page }: PremiumProductChatHeaderProps) {
  const product = page.product
  const productName = product?.name || page.public_title || 'Produto Premium'
  const productDescription = product?.description || page.public_subtitle || ''
  const productImage = product?.image_url
  const productPrice = product?.price

  return (
    <div className="ppc-hero">
      <div className="ppc-hero-top-row">
        <button className="ppc-back-btn" aria-label="Voltar" type="button">
          <ArrowLeft size={20} />
        </button>
        <div className="ppc-trust-badge">
          <ShieldCheck size={14} />
          <span>Compra segura</span>
        </div>
      </div>

      <div className="ppc-hero-product">
        {productImage ? (
          <div className="ppc-product-image-wrap">
            <img src={productImage} alt={productName} className="ppc-product-image" />
          </div>
        ) : (
          <div className="ppc-product-image-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(0,194,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
        )}

        <div className="ppc-hero-info">
          {product && (
            <span className="ppc-hero-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              Mais vendido
            </span>
          )}
          <h1 className="ppc-hero-name">{productName}</h1>
          {productDescription && (
            <p className="ppc-hero-description">{productDescription}</p>
          )}
          {productPrice != null && (
            <p className="ppc-hero-price">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: product?.currency || 'BRL' }).format(productPrice)}
            </p>
          )}
        </div>
      </div>

      <div className="ppc-hero-benefits">
        <div className="ppc-benefit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          <span>Acesso imediato</span>
        </div>
        <div className="ppc-benefit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
          <span>Entrega automática</span>
        </div>
        <div className="ppc-benefit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00C2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          <span>Suporte especializado</span>
        </div>
      </div>

      <div className="ppc-hero-trust-bar">
        <div className="ppc-trust-online">
          <span className="ppc-online-dot" />
          <span>Atendimento automático online</span>
        </div>
        <span className="ppc-trust-divider" />
        <span className="ppc-trust-text">Entrega automática disponível</span>
      </div>

      <div className="ppc-hero-transition">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00C2FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        <h2 className="ppc-transition-title">Vamos te ajudar a liberar seu acesso!</h2>
        <p className="ppc-transition-subtitle">É rápido, seguro e 100% automático.</p>
        <div className="ppc-transition-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </div>
      </div>
    </div>
  )
}
