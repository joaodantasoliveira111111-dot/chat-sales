import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { DollarSign, Users, ShoppingCart, TrendingUp, BarChart3, Zap, ArrowRight, Search, Mail } from 'lucide-react'

export const dynamic = 'force-static'

export default function DesignPreviewPage() {
  return (
    <div className="min-h-screen bg-[#F3F7FB] p-8 space-y-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-2">
          <Badge variant="info" size="sm">DESIGN SYSTEM v2</Badge>
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 600, color: '#081827', letterSpacing: '-0.025em' }}>
          Chatfy Premium
        </h1>
        <p style={{ fontSize: 14, color: '#71869B', marginTop: 4 }}>
          Preview visual dos tokens, componentes e estilos da nova identidade.
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-12">

        {/* PALETTE */}
        <section>
          <h2 style={{ fontSize: 26, fontWeight: 600, color: '#081827', letterSpacing: '-0.025em', marginBottom: 24 }}>Paleta de Cores</h2>

          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#35516B', marginBottom: 12 }}>Surfaces</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { name: 'bg-base', color: '#F3F7FB' },
                { name: 'bg-secondary', color: '#EAF1F8' },
                { name: 'bg-card-soft', color: '#F8FBFF' },
                { name: 'bg-card', color: '#FFFFFF' },
              ].map(c => (
                <div key={c.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 80, height: 80, borderRadius: 22, background: c.color, border: '1px solid rgba(8,24,39,0.08)', boxShadow: '10px 10px 24px rgba(8,24,39,0.06), -8px -8px 20px rgba(255,255,255,0.8)' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#71869B' }}>{c.name}</span>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#35516B' }}>{c.color}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16, marginTop: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#35516B', marginBottom: 12 }}>Brand</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { name: 'primary', color: '#0B7CFF' },
                { name: 'cyan-neon', color: '#00C2FF' },
                { name: 'violet', color: '#6D5DF6' },
                { name: 'success', color: '#16A34A' },
                { name: 'warning', color: '#F97316' },
                { name: 'error', color: '#DC2626' },
              ].map(c => (
                <div key={c.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 80, height: 80, borderRadius: 22, background: c.color, boxShadow: '10px 10px 24px rgba(8,24,39,0.06), -8px -8px 20px rgba(255,255,255,0.8)' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#71869B' }}>{c.name}</span>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#35516B' }}>{c.color}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 32 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, color: '#35516B', marginBottom: 12 }}>Text Hierarchy</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { name: 'primary', color: '#081827' },
                { name: 'secondary', color: '#35516B' },
                { name: 'tertiary', color: '#71869B' },
                { name: 'muted', color: '#94A3B8' },
              ].map(c => (
                <div key={c.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 80, height: 80, borderRadius: 22, background: c.color, border: '1px solid rgba(8,24,39,0.08)', boxShadow: '10px 10px 24px rgba(8,24,39,0.06), -8px -8px 20px rgba(255,255,255,0.8)' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#71869B' }}>{c.name}</span>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#35516B' }}>{c.color}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TYPOGRAPHY */}
        <section>
          <h2 style={{ fontSize: 26, fontWeight: 600, color: '#081827', letterSpacing: '-0.025em', marginBottom: 24 }}>Tipografia</h2>
          <Card variant="neu">
            <CardContent className="p-8 space-y-6">
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>H1 — 34px / 600</span>
                <p style={{ fontSize: 34, fontWeight: 600, color: '#081827', letterSpacing: '-0.025em', lineHeight: 1.2, marginTop: 4 }}>Receita Total</p>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>H2 — 26px / 600</span>
                <p style={{ fontSize: 26, fontWeight: 600, color: '#081827', letterSpacing: '-0.025em', lineHeight: 1.25, marginTop: 4 }}>Métricas do Mês</p>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>H3 — 20px / 600</span>
                <p style={{ fontSize: 20, fontWeight: 600, color: '#35516B', lineHeight: 1.3, marginTop: 4 }}>Últimos Pedidos</p>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Body — 14px / 400</span>
                <p style={{ fontSize: 14, color: '#35516B', lineHeight: 1.5, marginTop: 4 }}>Este é o texto padrão para o corpo do aplicativo. Ele deve ser legível e confortável para leitura prolongada.</p>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Label — 13px / 600</span>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#35516B', marginTop: 4 }}>Nome do Produto</p>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Número Principal — 38px / 800</span>
                <p style={{ fontSize: 38, fontWeight: 800, color: '#081827', letterSpacing: '-0.025em', lineHeight: 1.1, marginTop: 4 }}>R$ 12.450</p>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Número Secundário — 26px / 700</span>
                <p style={{ fontSize: 26, fontWeight: 700, color: '#35516B', letterSpacing: '-0.025em', lineHeight: 1.15, marginTop: 4 }}>847</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CARDS */}
        <section>
          <h2 style={{ fontSize: 26, fontWeight: 600, color: '#081827', letterSpacing: '-0.025em', marginBottom: 24 }}>Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="neu" hoverable>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-11 h-11 rounded-[14px] bg-[rgba(11,124,255,0.08)] flex items-center justify-center">
                    <DollarSign size={22} className="text-[#0B7CFF]" strokeWidth={2.2} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#71869B' }}>Receita</span>
                </div>
                <p style={{ fontSize: 38, fontWeight: 800, color: '#081827', letterSpacing: '-0.025em', lineHeight: 1.1 }}>R$ 12.450</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#16A34A', marginTop: 8 }}>+12.5% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card variant="neu-soft" hoverable>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-11 h-11 rounded-[14px] bg-[rgba(109,93,246,0.08)] flex items-center justify-center">
                    <Users size={22} className="text-[#6D5DF6]" strokeWidth={2.2} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#71869B' }}>Clientes</span>
                </div>
                <p style={{ fontSize: 38, fontWeight: 800, color: '#081827', letterSpacing: '-0.025em', lineHeight: 1.1 }}>847</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#16A34A', marginTop: 8 }}>+8.2% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card variant="flat">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-11 h-11 rounded-[14px] bg-[rgba(0,194,255,0.08)] flex items-center justify-center">
                    <ShoppingCart size={22} className="text-[#00C2FF]" strokeWidth={2.2} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#71869B' }}>Pedidos</span>
                </div>
                <p style={{ fontSize: 26, fontWeight: 700, color: '#081827', letterSpacing: '-0.025em', lineHeight: 1.1 }}>156</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#F97316', marginTop: 8 }}>-2.1% vs mês anterior</p>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Card Elevated</CardTitle>
                <CardDescription>Para modais, dropdowns e elementos flutuantes.</CardDescription>
              </CardHeader>
              <CardContent>
                <p style={{ fontSize: 14, color: '#35516B' }}>Conteúdo com sombra mais intensa para indicar elevação na hierarquia.</p>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Zap size={20} className="text-[#F97316]" strokeWidth={2.2} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#081827' }}>Destaque</span>
                </div>
                <p style={{ fontSize: 14, color: '#35516B' }}>Card com borda forte para chamar atenção. Usado em alertas ou CTAs.</p>
              </CardContent>
            </Card>

            <Card variant="default">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 size={20} className="text-[#71869B]" strokeWidth={2.2} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#081827' }}>Padrão</span>
                </div>
                <p style={{ fontSize: 14, color: '#35516B' }}>Card padrão com sombra leve. Para compatibilidade.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* BUTTONS */}
        <section>
          <h2 style={{ fontSize: 26, fontWeight: 600, color: '#081827', letterSpacing: '-0.025em', marginBottom: 24 }}>Botões</h2>
          <Card variant="neu">
            <CardContent className="p-8 space-y-8">
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'block' }}>Variantes</span>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'block' }}>Tamanhos</span>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button variant="primary" size="sm">Small</Button>
                  <Button variant="primary" size="md">Medium</Button>
                  <Button variant="primary" size="lg">Large</Button>
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'block' }}>Com ícones</span>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button variant="primary" leftIcon={<DollarSign size={16} strokeWidth={2.2} />}>Comprar</Button>
                  <Button variant="secondary" rightIcon={<ArrowRight size={16} strokeWidth={2.2} />}>Continuar</Button>
                  <Button variant="primary" isLoading>Carregando</Button>
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'block' }}>Full width</span>
                <Button variant="primary" fullWidth size="lg">Criar Conta</Button>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'block' }}>Disabled</span>
                <div className="flex flex-wrap gap-3 items-center">
                  <Button variant="primary" disabled>Primary</Button>
                  <Button variant="secondary" disabled>Secondary</Button>
                  <Button variant="outline" disabled>Outline</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* INPUTS */}
        <section>
          <h2 style={{ fontSize: 26, fontWeight: 600, color: '#081827', letterSpacing: '-0.025em', marginBottom: 24 }}>Inputs</h2>
          <Card variant="neu">
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Nome completo" placeholder="Digite seu nome..." fullWidth />
                <Input label="E-mail" type="email" placeholder="seu@email.com" leftIcon={<Mail size={18} strokeWidth={2.2} />} fullWidth />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Buscar" placeholder="Buscar produtos..." leftIcon={<Search size={18} strokeWidth={2.2} />} fullWidth />
                <Input label="Com erro" placeholder="Campo inválido..." error="Este campo é obrigatório" fullWidth />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Com helper" placeholder="Ex: 100.00" helperText="Use ponto para decimais" fullWidth />
                <Input label="Desabilitado" placeholder="Não editável" disabled fullWidth />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* BADGES */}
        <section>
          <h2 style={{ fontSize: 26, fontWeight: 600, color: '#081827', letterSpacing: '-0.025em', marginBottom: 24 }}>Badges</h2>
          <Card variant="neu">
            <CardContent className="p-8">
              <div className="flex flex-wrap gap-3 items-center">
                <Badge variant="success" size="sm">Ativo</Badge>
                <Badge variant="warning" size="sm">Pendente</Badge>
                <Badge variant="danger" size="sm">Inativo</Badge>
                <Badge variant="info" size="sm">Novo</Badge>
                <Badge variant="default" size="sm">Padrão</Badge>
              </div>
              <div className="flex flex-wrap gap-3 items-center mt-4">
                <Badge variant="success">Sucesso</Badge>
                <Badge variant="warning">Aviso</Badge>
                <Badge variant="danger">Erro</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* GLOWS */}
        <section>
          <h2 style={{ fontSize: 26, fontWeight: 600, color: '#081827', letterSpacing: '-0.025em', marginBottom: 24 }}>Neon Glows (Estratégico)</h2>
          <Card variant="neu">
            <CardContent className="p-8 space-y-6">
              <div className="flex flex-wrap gap-6 items-center">
                <div style={{ padding: '12px 24px', borderRadius: 12, background: '#0B7CFF', color: 'white', fontWeight: 600, boxShadow: '0 0 18px rgba(11,124,255,0.25)' }}>Primary Glow</div>
                <div style={{ padding: '12px 24px', borderRadius: 12, background: '#00C2FF', color: 'white', fontWeight: 600, boxShadow: '0 0 18px rgba(0,194,255,0.18)' }}>Cyan Glow</div>
                <div style={{ padding: '12px 24px', borderRadius: 12, background: '#6D5DF6', color: 'white', fontWeight: 600, boxShadow: '0 0 18px rgba(109,93,246,0.18)' }}>Violet Glow</div>
                <div style={{ padding: '12px 24px', borderRadius: 12, background: '#16A34A', color: 'white', fontWeight: 600, boxShadow: '0 0 14px rgba(22,163,74,0.15)' }}>Success Glow</div>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'block' }}>Input com focus glow (clique para ver)</span>
                <div className="max-w-sm">
                  <Input label="Foco aqui..." placeholder="Clique e veja o glow" fullWidth />
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'block' }}>Cyan strong glow (conexões ativas)</span>
                <div style={{ width: 96, height: 4, borderRadius: 9999, background: '#00C2FF', boxShadow: '0 0 26px rgba(0,194,255,0.28)' }} />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* NEUMORPHISM STATES */}
        <section>
          <h2 style={{ fontSize: 26, fontWeight: 600, color: '#081827', letterSpacing: '-0.025em', marginBottom: 24 }}>Neumorphism States</h2>
          <Card variant="neu">
            <CardContent className="p-8 space-y-6">
              <div className="flex flex-wrap gap-6 items-center">
                <div style={{ padding: '16px 24px', borderRadius: 22, background: '#F3F7FB', boxShadow: '10px 10px 24px rgba(8,24,39,0.06), -8px -8px 20px rgba(255,255,255,0.8)', border: '1px solid rgba(8,24,39,0.08)' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#35516B' }}>Raised</span>
                </div>
                <div style={{ padding: '16px 24px', borderRadius: 22, background: '#F3F7FB', boxShadow: 'inset 4px 4px 8px rgba(8,24,39,0.06), inset -2px -2px 6px rgba(255,255,255,0.6)', border: '1px solid rgba(8,24,39,0.08)' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#71869B' }}>Pressed</span>
                </div>
                <div style={{ padding: '16px 24px', borderRadius: 22, background: '#F3F7FB', boxShadow: '6px 6px 16px rgba(8,24,39,0.04), -4px -4px 12px rgba(255,255,255,0.7)', border: '1px solid rgba(8,24,39,0.06)' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#35516B' }}>Subtle</span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12, display: 'block' }}>Botão pressed state (clique e segure)</span>
                <Button variant="primary" size="lg">Clique e segure</Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* SHADOWS */}
        <section>
          <h2 style={{ fontSize: 26, fontWeight: 600, color: '#081827', letterSpacing: '-0.025em', marginBottom: 24 }}>Shadows & Radius</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div style={{ padding: 32, borderRadius: 22, background: 'white', boxShadow: '10px 10px 24px rgba(8,24,39,0.06), -8px -8px 20px rgba(255,255,255,0.8)', border: '1px solid rgba(8,24,39,0.08)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Neu Raised</span>
              <p style={{ fontSize: 14, color: '#35516B' }}>radius: 22px | dual shadow</p>
            </div>
            <div style={{ padding: 32, borderRadius: 22, background: 'white', boxShadow: '14px 14px 32px rgba(8,24,39,0.08), -10px -10px 24px rgba(255,255,255,0.9)', border: '1px solid rgba(8,24,39,0.08)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Neu Hover</span>
              <p style={{ fontSize: 14, color: '#35516B' }}>radius: 22px | hover shadow</p>
            </div>
            <div style={{ padding: 32, borderRadius: 12, background: 'white', boxShadow: '0 1px 3px rgba(8,24,39,0.04), 0 1px 2px rgba(8,24,39,0.02)', border: '1px solid rgba(8,24,39,0.08)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Flat</span>
              <p style={{ fontSize: 14, color: '#35516B' }}>radius: 12px | minimal shadow</p>
            </div>
            <div style={{ padding: 32, borderRadius: 22, background: 'white', boxShadow: '0 8px 32px rgba(8,24,39,0.1), 0 2px 8px rgba(8,24,39,0.04)', border: '1px solid rgba(8,24,39,0.08)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#71869B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>Elevated</span>
              <p style={{ fontSize: 14, color: '#35516B' }}>radius: 22px | modal shadow</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
