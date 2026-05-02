import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://brkxyctgezsrrxoerbvz.supabase.co'
const supabaseKey = 'sb_publishable_46_irNB6y2z07ZVe2xB1ng_YaoqQ5Fo'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createUser() {
  console.log('Criando usuário eufilipisantos@chatfy.com...')
  const { data, error } = await supabase.auth.signUp({
    email: 'eufilipisantos@chatfy.com',
    password: 'Melf1209@',
  })

  if (error) {
    console.error('Erro ao criar usuário:', error.message)
    
    // Tenta fazer login caso já exista
    if (error.message.includes('User already registered') || error.status === 400) {
      console.log('Tentando fazer login...')
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'eufilipisantos@chatfy.com',
        password: 'Melf1209@',
      })
      if (loginError) {
        console.error('Erro no login:', loginError.message)
      } else {
        console.log('Usuário já existe. Login efetuado com sucesso:', loginData.user.id)
      }
    }
  } else {
    console.log('Usuário criado com sucesso:', data.user?.id)
  }
}

createUser()
