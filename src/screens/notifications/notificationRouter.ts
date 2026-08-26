

export const handleNotificationNavigation = (
  navigationRef: any,
  data: any,
) => {

  console.log(
    '====================================',
  );

  console.log(
    '🔀 NOTIFICATION REDIRECTION',
  );

  console.log(
    'Notification Data:',
    data,
  );

  console.log(
    '====================================',
  );

  if (!data) {
    console.log(
      '⚠️ Notification data missing',
    );
    return;
  }

  const type = data?.type;

  switch (type) {

    case 'ORDER': {

      const orderId =
        data?.order_id;

      if (!orderId) {
        console.log(
          '❌ order_id missing',
        );
        return;
      }

      console.log(
        '🛒 Opening OrderDetails:',
        orderId,
      );

      if (navigationRef.isReady()) {
        navigationRef.navigate(
          'OrderDetails',
          {
            orderId,
          },
        );
      }

      break;
    }

    case 'APPOINTMENT': {

      const appointmentId =
        data?.appointment_id;

      if (!appointmentId) {
        console.log(
          '❌ appointment_id missing',
        );
        return;
      }

      if (navigationRef.isReady()) {
        navigationRef.navigate(
          'AppointmentDetails',
          {
            appointmentId,
          },
        );
      }

      break;
    }

    case 'PRODUCT': {

      const productId =
        data?.product_id;

      if (!productId) {
        console.log(
          '❌ product_id missing',
        );
        return;
      }

      if (navigationRef.isReady()) {
        navigationRef.navigate(
          'ProductDetails',
          {
            productId,
          },
        );
      }

      break;
    }

    case 'DIET': {

      const dietId =
        data?.diet_id;

      if (!dietId) {
        console.log(
          '❌ diet_id missing',
        );
        return;
      }

      if (navigationRef.isReady()) {
        navigationRef.navigate(
          'DietDetails',
          {
            dietId,
          },
        );
      }

      break;
    }

    case 'DOCTOR': {

      const doctorId =
        data?.doctor_id;

      if (!doctorId) {
        console.log(
          '❌ doctor_id missing',
        );
        return;
      }

      if (navigationRef.isReady()) {
        navigationRef.navigate(
          'DoctorDetails',
          {
            doctorId,
          },
        );
      }

      break;
    }

    case 'PROMOTION': {

      const promotionId =
        data?.promotion_id;

      console.log(
        '🎁 Opening Promotion:',
        promotionId,
      );

      if (navigationRef.isReady()) {
        navigationRef.navigate(
          'PromotionDetails',
          {
            promotionId,
          },
        );
      }

      break;
    }

    case 'GENERAL': {

      if (navigationRef.isReady()) {
        navigationRef.navigate(
          'Home',
        );
      }

      break;
    }

    default: {

      console.log(
        '⚠️ Unknown notification type:',
        type,
      );

      if (navigationRef.isReady()) {
        navigationRef.navigate(
          'Home',
        );
      }

      break;
    }
  }
};

