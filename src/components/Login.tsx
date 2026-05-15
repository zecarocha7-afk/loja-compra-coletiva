import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Lock, User as UserIcon, LogIn, Mail, Terminal, Phone, MapPin, Building, Award, Camera, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MilitaryProfile, UserRole } from '../types';

interface LoginProps {
  isNested?: boolean;
}

export default function Login({ isNested = false }: LoginProps) {
  const { login, register, resetPassword } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Common Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register Fields
  const [fullName, setFullName] = useState('');
  const [pmNumber, setPmNumber] = useState('');
  const [unit, setUnit] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('militar');

  const translateError = (message: string) => {
    if (message.includes('auth/invalid-credential') || message.includes('auth/wrong-password') || message.includes('auth/user-not-found')) {
      return 'Credenciais inválidas. Verifique seu email e senha.';
    }
    if (message.includes('auth/email-already-in-use')) {
      return 'Este email já está em uso por outro militar.';
    }
    if (message.includes('auth/weak-password')) {
      return 'A senha é muito fraca. Use pelo menos 6 caracteres.';
    }
    if (message.includes('permission-denied')) {
      return 'Acesso negado. Você não tem permissão para esta operação.';
    }
    return message;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(translateError(err.message || 'Falha na autenticação operacional.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const profile: Omit<MilitaryProfile, 'createdAt' | 'updatedAt'> = {
        fullName,
        pmNumber,
        unit,
        city,
        phone,
        email,
        role
      };
      await register(email, password, profile);
    } catch (err: any) {
      setError(translateError(err.message || 'Falha no registro do contingente.'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      alert('Instruções de recuperação enviadas para o correio eletrônico provido.');
      setIsForgotPassword(false);
    } catch (err: any) {
      setError(err.message || 'Falha na solicitação de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${!isNested ? 'min-h-screen' : ''} w-full flex items-center justify-center p-6 relative overflow-hidden industrial-grid bg-industrial-bg`}>
      {!isNested && (
        <>
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-industrial-red/5 rounded-full blur-[120px]"></div>
        </>
      )}
      
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full ${isRegistering ? 'max-w-[800px]' : 'max-w-[480px]'} z-10 space-y-4`}
      >
        <div className="bg-industrial-surface/90 backdrop-blur-xl border border-industrial-outline p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative border-t-4 border-t-industrial-red metallic-border">
          <div className="flex flex-col items-center mb-8 text-center">
             <div className="flex flex-col items-center gap-4 mb-6">
                <div className="bg-industrial-red/10 p-3 border border-industrial-red/20 shadow-[0_0_15px_rgba(218,41,28,0.2)]">
                  <Terminal className="w-8 h-8 text-industrial-red" />
                </div>
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">
                  GESTOR DE COMPRA <br />
                  <span className="text-industrial-red">COLETIVA</span>
                </h1>
             </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-industrial-red/10 border-l-4 border-industrial-red p-4 mb-6 text-[10px] text-industrial-red uppercase font-black tracking-widest"
            >
              ERRO_SISTEMA: {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {isForgotPassword ? (
              <motion.form 
                key="forgot"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onSubmit={handleReset} className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase block tracking-[0.2em]">CORREIO_ELETRÔNICO</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-industrial-red transition-colors" />
                    <input 
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="MILITAR@EXEMPLO.COM"
                      className="w-full bg-black/40 border border-industrial-outline focus:border-industrial-red outline-none py-4 pl-12 pr-4 text-[11px] text-white transition-all placeholder:text-gray-700 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 space-y-4">
                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full bg-industrial-red hover:bg-industrial-red/80 text-white py-4 font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{loading ? 'PROCESSANDO...' : 'SOLICITAR_RECUPERAÇÃO'}</span>
                  </button>
                  <button 
                    type="button" onClick={() => setIsForgotPassword(false)}
                    className="w-full text-[10px] text-gray-500 hover:text-white uppercase font-black tracking-widest transition-colors"
                  >
                    RETORNAR_AO_LOGIN
                  </button>
                </div>
              </motion.form>
            ) : isRegistering ? (
              <motion.form 
                key="register"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onSubmit={handleRegister} className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase block tracking-widest">NOME_COMPLETO</label>
                      <div className="relative group">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-industrial-red transition-colors" />
                        <input 
                          type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                          placeholder="SD PM FULANO DE TAL"
                          className="w-full bg-black/40 border border-industrial-outline focus:border-industrial-red outline-none py-3 pl-12 text-[11px] text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase block tracking-widest">MATRÍCULA_PM</label>
                      <div className="relative group">
                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-industrial-red transition-colors" />
                        <input 
                          type="text" required value={pmNumber} onChange={(e) => setPmNumber(e.target.value)}
                          placeholder="000.000-0"
                          className="w-full bg-black/40 border border-industrial-outline focus:border-industrial-red outline-none py-3 pl-12 text-[11px] text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase block tracking-widest">UNIDADE_LOTAÇÃO</label>
                      <div className="relative group">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-industrial-red transition-colors" />
                        <input 
                          type="text" required value={unit} onChange={(e) => setUnit(e.target.value)}
                          placeholder="Ex: 5º BPM / 1ª CIA"
                          className="w-full bg-black/40 border border-industrial-outline focus:border-industrial-red outline-none py-3 pl-12 text-[11px] text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase block tracking-widest">CIDADE_BASE</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-industrial-red transition-colors" />
                        <input 
                          type="text" required value={city} onChange={(e) => setCity(e.target.value)}
                          placeholder="BELO HORIZONTE"
                          className="w-full bg-black/40 border border-industrial-outline focus:border-industrial-red outline-none py-3 pl-12 text-[11px] text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase block tracking-widest">CORREIO_OPS</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-industrial-red transition-colors" />
                        <input 
                          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                          placeholder="PM@EXEMPLO.COM"
                          className="w-full bg-black/40 border border-industrial-outline focus:border-industrial-red outline-none py-3 pl-12 text-[11px] text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase block tracking-widest">FRASE_SECRETA (SENHA)</label>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-industrial-red transition-colors" />
                        <input 
                          type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-black/40 border border-industrial-outline focus:border-industrial-red outline-none py-3 pl-12 pr-10 text-[11px] text-white font-mono"
                        />
                        <button 
                          type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-industrial-red"
                        >
                          {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase block tracking-widest">TEL_CONTATO</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-industrial-red transition-colors" />
                        <input 
                          type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                          placeholder="(31) 9....-...."
                          className="w-full bg-black/40 border border-industrial-outline focus:border-industrial-red outline-none py-3 pl-12 text-[11px] text-white font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase block tracking-widest">NÍVEL_OPERACIONAL</label>
                      <select 
                        value={role} onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full bg-black/40 border border-industrial-outline focus:border-industrial-red outline-none py-3 px-4 text-[11px] text-white font-mono appearance-none"
                      >
                        <option value="militar" className="bg-zinc-900">MILITAR_OPERACIONAL</option>
                        <option value="administrador" className="bg-zinc-900">ADMIN_LOGÍSTICA</option>
                        <option value="fornecedor" className="bg-zinc-900">FORNECEDOR_HOMOLOGADO</option>
                      </select>
                    </div>

                    <div className="pt-2">
                       <label className="flex items-center space-x-3 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded-none border-industrial-outline bg-black text-industrial-gold focus:ring-0" />
                        <span className="text-[9px] font-black text-gray-500 group-hover:text-industrial-gold transition-colors uppercase tracking-widest leading-tight">
                          Desejo me cadastrar também para <br />
                          <span className="text-industrial-gold">compras individuais</span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-col items-center gap-4">
                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full bg-industrial-red hover:bg-industrial-red/80 text-white py-4 font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{loading ? 'ALISTANDO...' : 'CONFIRMAR_ALISTAMENTO'}</span>
                  </button>
                  <button 
                    type="button" onClick={() => setIsRegistering(false)}
                    className="text-[10px] text-gray-500 hover:text-white uppercase font-black tracking-widest transition-colors"
                  >
                    JÁ_POSSUO_REGISTRO
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form 
                key="login"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onSubmit={handleLogin} className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase block tracking-widest">EMAIL</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-industrial-red transition-colors" />
                    <input 
                      type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="MILITAR@EXEMPLO.COM"
                      className="w-full bg-black/40 border border-industrial-outline focus:border-industrial-red outline-none py-4 pl-12 pr-4 text-[11px] text-white font-mono placeholder:text-gray-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase block tracking-widest">SENHA</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-industrial-red transition-colors" />
                    <input 
                      type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/40 border border-industrial-outline focus:border-industrial-red outline-none py-4 pl-12 pr-10 text-[11px] text-white font-mono placeholder:text-gray-700"
                    />
                     <button 
                        type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-industrial-red"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <label className="flex items-center space-x-2 cursor-pointer group text-gray-500 hover:text-gray-200 transition-colors uppercase font-black tracking-tighter">
                    <input type="checkbox" className="w-3 h-3 rounded-none border-industrial-outline bg-black text-industrial-red focus:ring-0" />
                    <span>MANTER_CONEXÃO</span>
                  </label>
                  <button 
                    type="button" onClick={() => setIsForgotPassword(true)}
                    className="text-industrial-gold hover:text-gray-200 transition-colors uppercase font-black"
                  >
                    PROBLEMAS_ACESSO?
                  </button>
                </div>

                <div className="pt-4 space-y-4">
                  <button 
                    disabled={loading}
                    type="submit"
                    className="w-full bg-industrial-red hover:bg-industrial-red/80 text-white py-4 font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{loading ? 'AUTENTICANDO...' : 'INICIAR_SESSÃO'}</span>
                    <LogIn className="w-4 h-4" />
                  </button>
                  <button 
                    type="button" onClick={() => setIsRegistering(true)}
                    className="w-full text-[10px] text-gray-500 hover:text-white uppercase font-black tracking-widest transition-colors py-2"
                  >
                    SOLICITAR_REGISTRO_DE_CONTINGENTE
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-10 pt-6 border-t border-industrial-outline/30 flex flex-col items-center">
            <div className="flex items-center space-x-2 mb-2 opacity-80">
              <Shield className="w-4 h-4 text-industrial-red" />
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">PMMG • GESTÃO_COLETIVA_FARDAMENTO</span>
            </div>
          </div>
        </div>

        <div className="bg-industrial-surface/90 backdrop-blur-md border border-industrial-outline p-6 shadow-2xl flex justify-between items-center border-t-4 border-t-industrial-red metallic-border">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-industrial-gold rounded-full animate-pulse"></span>
            <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest">ESTADO: OPERACIONAL_SYNC</span>
          </div>
          <span className="text-[9px] text-gray-500 uppercase font-mono">v4.15.0_STABLE</span>
        </div>
      </motion.main>

      {!isNested && (
        <footer className="fixed bottom-0 w-full py-4 px-8 flex justify-between items-center bg-black/60 border-t border-industrial-outline backdrop-blur-md">
          <span className="text-[9px] tracking-[0.2em] text-gray-600 uppercase font-mono">
            © 2026 PMMG - CÓRTEX LOGÍSTICA INTEGRADA
          </span>
          <div className="flex space-x-6">
            <button className="text-[9px] tracking-widest text-gray-700 hover:text-industrial-red transition-colors uppercase font-mono">TERMOS_OPS</button>
            <button className="text-[9px] tracking-widest text-gray-700 hover:text-industrial-red transition-colors uppercase font-mono">MANIFESTO_PRIVACIDADE</button>
          </div>
        </footer>
      )}
    </div>
  );
}
