


import Share, {
  Social,
} from 'react-native-share';
import Clipboard from '@react-native-clipboard/clipboard';

export const handleShareAction = async ({
  type,
  message,
  onComplete,
}: {
  type: string;
  message: string;
  onComplete?: () => void;
}) => {
  try {
    if (type === 'copy') {
      Clipboard.setString(message);
      onComplete?.();
      return;
    }

    if (type === 'message') {
      await Share.open({
        message,
      });

      onComplete?.();
      return;
    }

    const shareOptions: any = {
      message,
    };

    if (type === 'whatsapp') {
      shareOptions.social =
        Social.Whatsapp;
    } else if (type === 'email') {
      shareOptions.social =
        Social.Email;

      shareOptions.subject =
        'Appointment Details';
    }

    await Share.shareSingle(
      shareOptions,
    );

    onComplete?.();
  } catch (error) {
    console.log(
      `SHARE ${type} ERROR =>`,
      error,
    );
  }
};


