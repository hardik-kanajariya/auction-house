import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeSlash, Envelope, User, Lock, Phone } from '@phosphor-icons/react';
import { toast } from 'sonner';

export const AuthModal = () => {
  const { login, register, verifyEmail, resendVerification, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  // Verification form state
  const [verificationData, setVerificationData] = useState({
    email: '',
    verificationCode: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email || !loginData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    await login(loginData);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.email || !registerData.password || !registerData.firstName || !registerData.lastName) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const { confirmPassword, ...registrationData } = registerData;
    await register(registrationData);
    
    if (!error) {
      setRegisteredEmail(registerData.email);
      setVerificationData(prev => ({ ...prev, email: registerData.email }));
      setShowVerification(true);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationData.verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    await verifyEmail(verificationData);
    
    if (!error) {
      setShowVerification(false);
      setActiveTab('login');
      toast.success('Email verified! You can now log in.');
    }
  };

  const handleResendVerification = async () => {
    if (verificationData.email) {
      await resendVerification(verificationData.email);
    }
  };

  if (showVerification) {
    return (
      <div className=\"fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4\">
        <Card className=\"w-full max-w-md\">
          <CardHeader className=\"text-center\">
            <CardTitle className=\"flex items-center justify-center gap-2\">
              <Envelope size={24} className=\"text-primary\" />
              Verify Your Email
            </CardTitle>
            <CardDescription>
              We've sent a verification code to {registeredEmail}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerification} className=\"space-y-4\">
              <div className=\"space-y-2\">
                <Label htmlFor=\"verificationCode\">Verification Code</Label>
                <Input
                  id=\"verificationCode\"
                  type=\"text\"
                  placeholder=\"Enter 6-digit code\"
                  maxLength={6}
                  value={verificationData.verificationCode}
                  onChange={(e) => setVerificationData(prev => ({
                    ...prev,
                    verificationCode: e.target.value.toUpperCase()
                  }))}
                  className=\"text-center text-lg font-mono\"
                />
              </div>
              
              <Button type=\"submit\" className=\"w-full\" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </Button>
              
              <div className=\"text-center\">
                <Button
                  type=\"button\"
                  variant=\"ghost\"
                  size=\"sm\"
                  onClick={handleResendVerification}
                  disabled={isLoading}
                >
                  Resend Code
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className=\"fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4\">
      <Card className=\"w-full max-w-md\">
        <CardHeader className=\"text-center\">
          <CardTitle>Welcome to AuctionHub</CardTitle>
          <CardDescription>
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className=\"grid w-full grid-cols-2\">
              <TabsTrigger value=\"login\">Sign In</TabsTrigger>
              <TabsTrigger value=\"register\">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value=\"login\" className=\"space-y-4 mt-6\">
              <form onSubmit={handleLogin} className=\"space-y-4\">
                <div className=\"space-y-2\">
                  <Label htmlFor=\"login-email\">Email</Label>
                  <div className=\"relative\">
                    <Envelope size={18} className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground\" />
                    <Input
                      id=\"login-email\"
                      type=\"email\"
                      placeholder=\"your@email.com\"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className=\"pl-10\"
                    />
                  </div>
                </div>
                
                <div className=\"space-y-2\">
                  <Label htmlFor=\"login-password\">Password</Label>
                  <div className=\"relative\">
                    <Lock size={18} className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground\" />
                    <Input
                      id=\"login-password\"
                      type={showPassword ? 'text' : 'password'}
                      placeholder=\"Enter your password\"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className=\"pl-10 pr-10\"
                    />
                    <Button
                      type=\"button\"
                      variant=\"ghost\"
                      size=\"sm\"
                      className=\"absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0\"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>
                
                <Button type=\"submit\" className=\"w-full\" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
              
              <div className=\"text-center text-sm text-muted-foreground\">
                Demo credentials: admin@auctionhub.com (any password)
              </div>
            </TabsContent>
            
            <TabsContent value=\"register\" className=\"space-y-4 mt-6\">
              <form onSubmit={handleRegister} className=\"space-y-4\">
                <div className=\"grid grid-cols-2 gap-4\">
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"firstName\">First Name</Label>
                    <div className=\"relative\">
                      <User size={18} className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground\" />
                      <Input
                        id=\"firstName\"
                        type=\"text\"
                        placeholder=\"John\"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, firstName: e.target.value }))}
                        className=\"pl-10\"
                      />
                    </div>
                  </div>
                  
                  <div className=\"space-y-2\">
                    <Label htmlFor=\"lastName\">Last Name</Label>
                    <Input
                      id=\"lastName\"
                      type=\"text\"
                      placeholder=\"Doe\"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className=\"space-y-2\">
                  <Label htmlFor=\"register-email\">Email</Label>
                  <div className=\"relative\">
                    <Envelope size={18} className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground\" />
                    <Input
                      id=\"register-email\"
                      type=\"email\"
                      placeholder=\"your@email.com\"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      className=\"pl-10\"
                    />
                  </div>
                </div>
                
                <div className=\"space-y-2\">
                  <Label htmlFor=\"phone\">Phone (Optional)</Label>
                  <div className=\"relative\">
                    <Phone size={18} className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground\" />
                    <Input
                      id=\"phone\"
                      type=\"tel\"
                      placeholder=\"+1 (555) 123-4567\"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, phone: e.target.value }))}
                      className=\"pl-10\"
                    />
                  </div>
                </div>
                
                <div className=\"space-y-2\">
                  <Label htmlFor=\"register-password\">Password</Label>
                  <div className=\"relative\">
                    <Lock size={18} className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground\" />
                    <Input
                      id=\"register-password\"
                      type={showPassword ? 'text' : 'password'}
                      placeholder=\"Create a password\"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      className=\"pl-10 pr-10\"
                    />
                    <Button
                      type=\"button\"
                      variant=\"ghost\"
                      size=\"sm\"
                      className=\"absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0\"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>
                
                <div className=\"space-y-2\">
                  <Label htmlFor=\"confirmPassword\">Confirm Password</Label>
                  <div className=\"relative\">
                    <Lock size={18} className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground\" />
                    <Input
                      id=\"confirmPassword\"
                      type={showPassword ? 'text' : 'password'}
                      placeholder=\"Confirm your password\"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className=\"pl-10\"
                    />
                  </div>
                </div>
                
                <Button type=\"submit\" className=\"w-full\" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};