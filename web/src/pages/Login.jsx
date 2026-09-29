import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { Images } from '../common/images';
import { Utils } from '../common/utils';
import { showSuccessToast } from '../config/key';
import MarqueeCollage from '../components/MarqueeCollage';
import * as AuthService from '../services/authService';
import { parseDeletedAccountInfo } from '../services/profileService';
import { parsePolicyAcceptedCustomer } from '../utils/policyUtils';
import { Button } from '../components/ui';
import { AUTH_COPY as T } from '../content/auth';
import '../design/pages/auth.css';

const COLUMNS = [
  {
    id: 'left',
    direction: 'up',
    images: [
      Images.journeyConsult,
      Images.journeyMedicine,
      Images.journeyDelivery,
      Images.journeyDiet,
      Images.journeyYoga,
    ],
  },
  {
    id: 'center',
    direction: 'down',
    images: [Images.login11, Images.login12, Images.login13, Images.login2, Images.login10],
  },
  {
    id: 'right',
    direction: 'up',
    images: [Images.login8, Images.login14, Images.journeyConsult, Images.journeyDiet, Images.login11],
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % T.headlines.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const onChangePhone = (text) => {
    setPhone(text.replace(/[^0-9]/g, '').slice(0, 10));
  };

  const onLogin = async () => {
    if (phone.length !== 10) {
      showSuccessToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = `+91${phone}`;
      const hold = await Utils.getData('_DELETED_ACCOUNT_HOLD');
      if (hold?.phone && String(hold.phone) === fullPhone) {
        const days = Number(hold.retention_days) || 30;
        const heldAt = Number(hold.held_at) || 0;
        const msLeft = heldAt + days * 24 * 60 * 60 * 1000 - Date.now();
        if (msLeft <= 0) {
          await Utils.removeData('_DELETED_ACCOUNT_HOLD');
        }
      }

      const response = await AuthService.send_otp({ phone_number: fullPhone });
      const OTP = response?.data?.otp;
      const deletedInfo = parseDeletedAccountInfo(response);
      const isCustomer = response?.data?.user_roles?.some(
        (role) => role?.toLowerCase() === 'customer',
      );
      const policyAcceptedCustomer = parsePolicyAcceptedCustomer(response);
      await Utils.storeData('_POLICY_ACCEPTED_CUSTOMER', policyAcceptedCustomer);

      if (deletedInfo) {
        await Utils.storeData('_DELETED_ACCOUNT_HOLD', {
          phone: fullPhone,
          retention_days: deletedInfo.retentionDays,
          held_at: Date.now(),
        });
        Utils.storeData('_OTP', OTP);
        navigate('/otp', {
          state: {
            phone,
            customer: isCustomer,
            accountDeleted: true,
            retentionDays: deletedInfo.retentionDays,
            policyAcceptedCustomer,
          },
        });
        return;
      }

      if (response?.success) {
        Utils.storeData('_OTP', OTP);
        showSuccessToast(response.message || 'OTP sent successfully', 'success');
        navigate('/otp', {
          state: {
            phone,
            customer: isCustomer,
            policyAcceptedCustomer,
          },
        });
      } else {
        const errorMessage =
          response?.data?.errors?.phone_number?.[0] ||
          response?.message ||
          'Please enter a valid mobile number';
        showSuccessToast(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      showSuccessToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="au-page au-auth">
      <MarqueeCollage columns={COLUMNS} logo={Images.FinalLogo2} hint={T.brandHint} />
      <div className="au-sheet">
        <div className="au-sheet__handle" aria-hidden />
        <p className="au-kicker">{T.loginKicker}</p>
        <div>
          <h2 className="au-headline">{T.headlines[headlineIndex]}</h2>
          <div className="au-dots" aria-hidden>
            {T.headlines.map((_, i) => (
              <i key={i} className={i === headlineIndex ? 'is-on' : ''} />
            ))}
          </div>
        </div>

        <p className="au-label" id="login-phone-label">
          {T.mobileLabel}
        </p>
        <div className={`au-phone${focused ? ' is-focus' : ''}`}>
          <div className="au-phone__code">
            <span aria-hidden>IN</span>
            <span>{T.countryCode}</span>
          </div>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder={T.mobilePlaceholder}
            value={phone}
            aria-labelledby="login-phone-label"
            onChange={(e) => onChangePhone(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="tel"
          />
          {phone.length === 10 ? (
            <span className="au-phone__ok" aria-hidden>
              <Check size={18} />
            </span>
          ) : null}
        </div>

        <p className="au-note">{T.termsNote}</p>

        <Button
          variant="primary"
          block
          loading={isLoading}
          trailingIcon={isLoading ? null : <ArrowRight size={18} aria-hidden />}
          onClick={onLogin}
        >
          {isLoading ? T.sending : T.getOtp}
        </Button>
      </div>
    </section>
  );
}
